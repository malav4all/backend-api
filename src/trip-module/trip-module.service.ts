import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Trip, TripSchema } from './entity/trip-module.entity';
import {
  BatteryCheckInput,
  CreateTripInput,
  SearchTripInput,
  TripCountInput,
  TripIDInput,
  TripInput,
} from './dto/create-trip-module.input';
import { UpdateTripInput } from './dto/update-trip-module.update';
import { generateTripID } from '@imz/helper/generateotp';
import { InfluxdbService } from '@imz/influx-db/influx-db-.service';
import { UserService } from '@imz/user/user.service';
import { RedisService } from '@imz/redis/redis.service';

@Injectable()
export class TripService {
  constructor(
    @InjectConnection()
    private connection: Connection,
    private influxDbService: InfluxdbService,
    private UserModel: UserService,
    private readonly redisService: RedisService
  ) {}

  async getTenantModel<T>(
    tenantId: string,
    modelName: string,
    schema: any
  ): Promise<Model<T>> {
    const tenantConnection = await this.connection.useDb(`tenant_${tenantId}`);
    return tenantConnection.model(modelName, schema);
  }

  private calculateSkip(page: number, limit: number) {
    return page === -1 ? 0 : (page - 1) * limit;
  }

  private buildSearchQuery(search: string) {
    return search
      ? {
          $or: [
            { transitName: { $regex: search, $options: 'i' } },
            { tripRate: { $regex: search, $options: 'i' } },
            { minBatteryPercentage: { $regex: search, $options: 'i' } },
          ],
        }
      : { isDelete: false };
  }

  async create(payload: CreateTripInput) {
    try {
      const tripModel = await this.getTenantModel<Trip>(
        payload.accountId,
        Trip.name,
        TripSchema
      );

      const tripId = generateTripID();
      const record = await tripModel.create({
        ...payload,
        tripId,
      });
      const redisClient = this.redisService.getClient('additionalServer-0');

      const value = JSON.stringify({
        status: record.status,
        tripId: record.tripId,
        source: {
          ...record.startPoint,
          isAlreadyGenerateAlert: false,
        },
        destination: {
          ...record.endPoint,
          isAlreadyGenerateAlert: false,
        },
        battery: {
          batteryAlertSent: false,
          batteryAlertValue:
            Number(record?.alertConfig['alertDetails']?.lowBattery?.value) ?? 0,
        },
        overSpeed: {
          overSpeedAlertSent: false,
          overSpeedAlertValue:
            Number(record?.alertConfig['alertDetails']?.overSpeeding?.value) ??
            0,
        },
        overStop: {
          overStopAlertSent: false,
          overStopDuration:
            record?.alertConfig['alertDetails']?.overStopping?.value ?? 0,
        },
      });
      await redisClient.set(record.tripData[0].imei[0], value);
      return { record, tripId };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(input: TripInput, loggedInUser: any) {
    try {
      // Fetch user details
      const getUser = await this.UserModel.fetchUserByUserId(
        loggedInUser?.userId?.toString()
      );

      // Check the admin flags
      const isAccountAdmin = getUser[0]?.isAccountAdmin || false;
      const isSuperAdmin = getUser[0]?.isSuperAdmin || false;

      // Extract IMEIs from the user's imeiList or deviceGroup
      let imeiList = getUser[0]?.imeiList || [];

      if (!imeiList.length && getUser[0]?.deviceGroup?.length) {
        imeiList = getUser[0].deviceGroup.reduce(
          (acc: string[], group: any) => {
            if (group.imeiData && group.imeiData.length) {
              acc = acc.concat(group.imeiData);
            }
            return acc;
          },
          []
        );
      }

      // Get the trip model based on the accountId
      const tripModel = await this.getTenantModel<Trip>(
        input.accountId,
        Trip.name,
        TripSchema
      );

      const { page, limit, status } = input;
      const skip = this.calculateSkip(Number(page), Number(limit));

      const filter: any = {};

      if (status) {
        filter.status = status;
      }

      // Apply IMEI filter only if both flags are false
      if (!isAccountAdmin && !isSuperAdmin) {
        if (imeiList.length > 0) {
          filter['tripData.imei'] = { $in: imeiList };
        } else {
          // If there are no IMEIs, return an empty result
          return { records: [], count: 0 };
        }
      }

      const records = await tripModel
        .find(filter)
        .skip(skip)
        .limit(Number(limit))
        .lean()
        .exec();

      const count = await tripModel.countDocuments(filter);

      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async searchTrip(input: SearchTripInput) {
    try {
      const tripModel = await this.getTenantModel<Trip>(
        input.accountId,
        Trip.name,
        TripSchema
      );

      const { page, limit, search } = input;
      const skip = this.calculateSkip(Number(page), Number(limit));
      const query = this.buildSearchQuery(search);

      const records = await tripModel
        .find(query)
        .skip(skip)
        .limit(Number(limit))
        .lean()
        .exec();

      const count = await tripModel.countDocuments(query);

      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getTripDetailById(input: TripIDInput) {
    try {
      const tripModel = await this.getTenantModel<Trip>(
        input.accountId,
        Trip.name,
        TripSchema
      );

      const records = await tripModel
        .findOne({ tripId: input.tripId })
        .lean()
        .exec();

      return records;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(payload: UpdateTripInput) {
    try {
      const tripModel = await this.getTenantModel<Trip>(
        payload.accountId,
        Trip.name,
        TripSchema
      );

      const updatePayload = {
        ...payload,
        lastUpdated: new Date(),
      };
      const record = await tripModel
        .findByIdAndUpdate(payload._id, updatePayload, { new: true })
        .exec();
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async checkBatteryPercentage(
    input: BatteryCheckInput
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { imei, threshold } = input;

      const now = new Date().toISOString();
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const fluxQuery = `
        from(bucket: "${input.accountId}")
          |> range(start: ${oneHourAgo}, stop: ${now})
          |> filter(fn: (r) => r["_measurement"] == "track")
          |> filter(fn: (r) => r["imei"] == "${imei}")
          |> filter(fn: (r) => r["_field"] == "batteryPercentage")
          |> last()
      `;

      const queryResults = await this.influxDbService.executeQuery(fluxQuery);

      let batteryPercentage: number | null = null;
      let lastReportedTime: string | null = null;

      for await (const { values } of queryResults) {
        lastReportedTime = values[2]; // Assuming the timestamp is the first element
        const value = values[5]; // Assuming the battery percentage value is the fifth element
        batteryPercentage = parseFloat(value);
        break;
      }

      if (lastReportedTime === null) {
        throw new BadRequestException(
          `No data found for Terminal_ID ${imei} in the last hour`
        );
      }

      if (new Date(lastReportedTime) < new Date(oneHourAgo)) {
        return {
          success: false,
          message: `Device's last packet was received at ${lastReportedTime}`,
        };
      }

      if (batteryPercentage > Number(threshold)) {
        return {
          success: true,
          message: 'Battery percentage is above the threshold',
        };
      } else {
        throw new BadRequestException(
          'Battery percentage is below the threshold'
        );
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getTripStatusMetrics(
    accountId: string
  ): Promise<{ status: string; count: number }[]> {
    try {
      const tripModel = await this.getTenantModel<Trip>(
        accountId,
        Trip.name,
        TripSchema
      );

      if (!tripModel) {
        return [];
      }

      const metrics = await tripModel
        .aggregate([
          { $match: { accountId: accountId } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $project: { status: '$_id', count: 1, _id: 0 } },
        ])
        .exec();

      return metrics;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateTripStatus(accountId: string, tripId: string, status: string) {
    try {
      const tripModel = await this.getTenantModel<Trip>(
        accountId,
        Trip.name,
        TripSchema
      );

      const trip = await tripModel.findOne({ tripId });

      if (!trip) {
        throw new BadRequestException(`Trip with ID ${tripId} not found.`);
      }

      trip.status = status;
      trip.lastUpdated = new Date();

      const updatedTrip = await trip.save();

      return updatedTrip;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getActiveTripCounts(input: TripCountInput) {
    try {
      const tripModel = await this.getTenantModel<Trip>(
        input.accountId,
        Trip.name,
        TripSchema
      );
      const today = new Date();
      const todayDateString = today.toISOString().split('T')[0];

      const todayActiveTripsCount = await tripModel
        .countDocuments({
          tripStartDate: {
            $regex: `^${todayDateString}`, // Matches date part only
          },
        })
        .exec();

      const totalActiveTripsCount = await tripModel
        .countDocuments({
          status: 'created',
        })
        .exec();

      return {
        todayActiveTripsCount,
        totalActiveTripsCount,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to retrieve active trip counts: ${error.message}`
      );
    }
  }
}
