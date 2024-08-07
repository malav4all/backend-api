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
  TripIDInput,
  TripInput,
} from './dto/create-trip-module.input';
import { UpdateTripInput } from './dto/update-trip-module.update';
import { generateTripID } from '@imz/helper/generateotp';
import { InfluxdbService } from '@imz/influx-db/influx-db-.service';

@Injectable()
export class TripService {
  constructor(
    @InjectConnection()
    private connection: Connection,
    private influxDbService: InfluxdbService
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
      return { record, tripId };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(input: TripInput) {
    try {
      const tripModel = await this.getTenantModel<Trip>(
        input.accountId,
        Trip.name,
        TripSchema
      );

      const { page, limit } = input;
      const skip = this.calculateSkip(Number(page), Number(limit));

      const records = await tripModel
        .find({})
        .skip(skip)
        .limit(Number(limit))
        .lean()
        .exec();

      const count = await tripModel.countDocuments();
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
      const { terminalId, threshold } = input;

      const now = new Date().toISOString();
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const fluxQuery = `
        from(bucket: "${input.accountId})
          |> range(start: ${oneHourAgo}, stop: ${now})
          |> filter(fn: (r) => r["_measurement"] == "track")
          |> filter(fn: (r) => r["Terminal_ID"] == "${terminalId}")
          |> filter(fn: (r) => r["_field"] == "Additional_Data_1_Battery_Percentage")
          |> last()
      `;

      const queryResults = await this.influxDbService.executeQuery(fluxQuery);

      let batteryPercentage: number | null = null;
      let lastReportedTime: string | null = null;

      for await (const { values } of queryResults) {
        lastReportedTime = values[2]; // Assuming the timestamp is the first element
        const value = values[4]; // Assuming the battery percentage value is the fifth element
        batteryPercentage = parseFloat(value);
        break;
      }

      if (lastReportedTime === null) {
        throw new BadRequestException(
          `No data found for Terminal_ID ${terminalId} in the last hour`
        );
      }

      if (new Date(lastReportedTime) < new Date(oneHourAgo)) {
        return {
          success: false,
          message: `Device's last packet was received at ${lastReportedTime}`,
        };
      }

      if (batteryPercentage > threshold) {
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
}
