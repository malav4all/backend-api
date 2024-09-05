import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Alert, AlertSchema } from './entity/alert.entity';
import {
  AlertInput,
  AlertReportInputType,
  AlertTripReportInputType,
  CreateAlertInputType,
  DistanceReportInputType,
  DistanceTrackPlayInputType,
  DistanceTripReportInputType,
  MapViewInputType,
  SearchAlertInput,
} from './dto/create-alert.input';
import { RedisService } from '@imz/redis/redis.service';
import { UpdateAlertInput } from './dto/update-alert';
import { MqttClient } from 'mqtt';
import { PubSub } from 'graphql-subscriptions';
import axios from 'axios';
import { InfluxdbService } from '@imz/influx-db/influx-db-.service';
import { UserService } from '@imz/user/user.service';
import { convertISTToUTC } from '@imz/helper/generateotp';

@Injectable()
export class AlertService {
  constructor(
    @InjectConnection()
    private connection: Connection,
    private readonly redisService: RedisService,
    private influxDbService: InfluxdbService,
    private userService: UserService
  ) {}

  async sendOtp(mobileNumber: any, message: string) {
    try {
      const response = await axios.get(process.env.URL, {
        params: {
          method: 'SendMessage',
          v: '1.1',
          auth_scheme: process.env.AUTH_SCHEME,
          msg_type: process.env.MSG_TYPE,
          format: process.env.FORMAT,
          msg: `IMZ - ${message} is the One-Time Password (OTP) for login with IMZ`,
          send_to: Number(mobileNumber),
          userid: process.env.USERID,
          password: process.env.PASSWORD,
        },
        timeout: 120000,
      });

      return {
        success: response.status >= 400 ? 0 : 1,
        message:
          response.status >= 400
            ? 'Failed to send OTP'
            : 'OTP sent successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async setJsonValue(key: string, value: any): Promise<void> {
    const redisClient = this.redisService.getClient('default-0');
    await redisClient.set(key, JSON.stringify(value));
  }

  async getTenantModel<T>(
    tenantId: string | undefined,
    modelName: string,
    schema: any
  ): Promise<Model<T> | null> {
    if (!tenantId || !tenantId.trim()) {
      console.warn(
        'Tenant ID is undefined or empty, skipping tenant-specific model creation'
      );
      return null;
    }
    const tenantConnection = this.connection.useDb(
      `tenant_${tenantId.trim()}`,
      { useCache: true }
    );
    return tenantConnection.model(modelName, schema);
  }

  async create(payload: CreateAlertInputType) {
    try {
      const alertModel = await this.getTenantModel<Alert>(
        payload.accountId,
        Alert.name,
        AlertSchema
      );

      if (!alertModel) {
        console.warn('Skipping create operation as tenantModel is null');
        return null; // or handle the case as needed
      }

      const existingRecord = await alertModel.findOne({
        alertName: payload.alertName,
      });
      if (existingRecord) {
        throw new Error('Record Already Exists');
      }
      const record = await alertModel.create(payload);
      // const imeisToIterate =
      //   record.alertConfig.alertImeiGroup.imei ||
      //   record.alertConfig.userSelectedImei;

      // for (const alert of imeisToIterate) {
      //   await this.setJsonValue(alert, {
      //     mobileNo: record.mobileNo,
      //     alarmConfig: record.alertConfig.alertData,
      //   });
      // }

      return record;
    } catch (error) {
      throw new Error(`Failed to create: ${error.message}`);
    }
  }

  async searchAlert(input: SearchAlertInput) {
    try {
      const alertModel = await this.getTenantModel<Alert>(
        input.accountId,
        Alert.name,
        AlertSchema
      );

      if (!alertModel) {
        console.warn('Skipping search operation as tenantModel is null');
        return { records: [], count: 0 }; // return empty results or handle as needed
      }

      const page = Number(input.page) || 1;
      const limit = Number(input.limit) || 10;
      const skip = page === -1 ? 0 : (page - 1) * limit;
      const records = await alertModel
        .find({
          $or: [
            { alertName: { $regex: input.search, $options: 'i' } },
            { mobileNo: { $regex: input.search, $options: 'i' } },
            {
              'alertConfig.alertImeiGroup.deviceGroupName': {
                $regex: input.search,
                $options: 'i',
              },
            },
            {
              'alertConfig.userSelectedImei': {
                $regex: input.search,
                $options: 'i',
              },
            },
            { createdBy: { $regex: input.search, $options: 'i' } },
          ],
        })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      const count = await alertModel.countDocuments({
        $or: [
          { alertName: { $regex: input.search, $options: 'i' } },
          { mobileNo: { $regex: input.search, $options: 'i' } },
          {
            'alertConfig.alertImeiGroup.deviceGroupName': {
              $regex: input.search,
              $options: 'i',
            },
          },
          {
            'alertConfig.userSelectedImei': {
              $regex: input.search,
              $options: 'i',
            },
          },
          { createdBy: { $regex: input.search, $options: 'i' } },
        ],
      });

      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(input: AlertInput) {
    try {
      const alertModel = await this.getTenantModel<Alert>(
        input.accountId,
        Alert.name,
        AlertSchema
      );

      if (!alertModel) {
        console.warn('Skipping findAll operation as tenantModel is null');
        return { records: [], count: 0 }; // return empty results or handle as needed
      }

      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const records = await alertModel
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      const count = await alertModel.count().exec();
      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(payload: UpdateAlertInput) {
    try {
      const alertModel = await this.getTenantModel<Alert>(
        payload.accountId,
        Alert.name,
        AlertSchema
      );

      if (!alertModel) {
        console.warn('Skipping update operation as tenantModel is null');
        return null; // or handle as needed
      }

      const updatePayload = {
        ...payload,
        updatedAt: new Date(),
      };
      const record = await alertModel
        .findByIdAndUpdate(payload._id, updatePayload, {
          new: true,
        })
        .lean()
        .exec();
      const imeisToIterate =
        record.alertConfig.alertImeiGroup.imei ||
        record.alertConfig.userSelectedImei;

      for (const alert of imeisToIterate) {
        await this.setJsonValue(alert, record.alertConfig.alertData);
      }

      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async fetchAlertReport(payload: AlertReportInputType, loggedInUser: any) {
    if (!payload.accountId) {
      return { rowData: [], totalCount: 0 };
    }
    // Fetch the logged-in user object
    const getUser = await this.userService.fetchUserByUserId(
      loggedInUser?.userId?.toString()
    );

    // Check the admin flags
    const isAccountAdmin = getUser[0]?.isAccountAdmin || false;
    const isSuperAdmin = getUser[0]?.isSuperAdmin || false;

    let imeiList: string[] = [];

    // Only apply IMEI filtering if the user is not an account admin or super admin
    if (!isAccountAdmin && !isSuperAdmin) {
      imeiList = getUser[0]?.imeiList || [];

      // If imeiList is empty, extract IMEIs from the user's deviceGroup
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

      // If there are still no IMEIs associated with the user, return an empty result
      if (!imeiList.length) {
        return { rowData: [], totalCount: 0 };
      }
    }

    const page = Number(payload.page);
    const limit = Number(payload.limit);
    const skip = page === -1 ? 0 : (page - 1) * limit;
    const start = convertISTToUTC(payload.startDate);
    const end = convertISTToUTC(payload.endDate);

    // Create a Flux query for counting the total number of matching records
    const countQuery = `
    from(bucket: "${payload.accountId}")
      |> range(start: ${start}, stop: ${end})
      |> filter(fn: (r) => r["_measurement"] == "alert")
      ${
        !isAccountAdmin && !isSuperAdmin && imeiList.length
          ? `|> filter(fn: (r) => r["imei"] == "${imeiList.join(
              '" or r["imei"] == "'
            )}" )`
          : ''
      }
      |> count()
  `;
    const countResponse: any = await this.influxDbService.countQuery(
      countQuery
    );
    const totalCount = countResponse[0]?._value || 0;

    // Create a Flux query for fetching the alert data
    const query = `
    from(bucket: "${payload.accountId}")
      |> range(start: ${start}, stop: ${end})
      |> filter(fn: (r) => r["_measurement"] == "alert")
      ${
        !isAccountAdmin && !isSuperAdmin && imeiList.length
          ? `|> filter(fn: (r) => r["imei"] == "${imeiList.join(
              '" or r["imei"] == "'
            )}" )`
          : ''
      }
      |> filter(fn: (r) => r["_field"] == "latitude" or r["_field"] == "longitude" or r["_field"] == "alert" or r["_field"] == "accountId" or r["_field"] == "label")
      |> sort(columns:["_time"], desc: true)
      |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> limit(n: ${payload.limit}, offset: ${skip})
  `;

    const rowData = [];
    for await (const { values } of this.influxDbService.executeQuery(query)) {
      const [t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10] = values;
      rowData.push({
        time: t4,
        event: t5,
        imei: t6,
        accountId: t7,
        alertMessage: t8,
        latitude: t9,
        longitude: t10,
      });
    }

    return { rowData, totalCount };
  }

  async fetchTripAlertReport(payload: AlertTripReportInputType) {
    if (!payload.accountId) {
      return { rowData: [], totalCount: 0 };
    }
    // Fetch the logged-in user object

    const page = Number(payload.page);
    const limit = Number(payload.limit);
    const skip = page === -1 ? 0 : (page - 1) * limit;
    const start = convertISTToUTC(payload.startDate);
    const end = convertISTToUTC(payload.endDate);

    // Create a Flux query for counting the total number of matching records
    const countQuery = `
    from(bucket: "${payload.accountId}")
      |> range(start: ${start}, stop: ${end})
      |> filter(fn: (r) => r["_measurement"] == "alert")
      |> filter(fn: (r) => r["imei"] == ${payload.imei})
      |> count()
  `;
    const countResponse: any = await this.influxDbService.countQuery(
      countQuery
    );
    const totalCount = countResponse[0]?._value || 0;

    // Create a Flux query for fetching the alert data
    const query = `
    from(bucket: "${payload.accountId}")
      |> range(start: ${start}, stop: ${end})
      |> filter(fn: (r) => r["_measurement"] == "alert")
      |> filter(fn: (r) => r["imei"] == ${payload.imei})
      |> filter(fn: (r) => r["_field"] == "latitude" or r["_field"] == "longitude" or r["_field"] == "alert" or r["_field"] == "accountId" or r["_field"] == "label")
      |> sort(columns:["_time"], desc: true)
      |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> limit(n: ${payload.limit}, offset: ${skip})
  `;

    const rowData = [];
    for await (const { values } of this.influxDbService.executeQuery(query)) {
      const [t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10] = values;
      rowData.push({
        time: t4,
        event: t5,
        imei: t6,
        accountId: t7,
        alertMessage: t8,
        latitude: t9,
        longitude: t10,
      });
    }

    return { rowData, totalCount };
  }

  async distanceReport(payload: DistanceReportInputType, loggedInUser: any) {
    if (!payload.accountId) {
      return [];
    }
    // Fetch the logged-in user object
    const getUser = await this.userService.fetchUserByUserId(
      loggedInUser?.userId?.toString()
    );

    // Check the admin flags
    const isAccountAdmin = getUser[0]?.isAccountAdmin || false;
    const isSuperAdmin = getUser[0]?.isSuperAdmin || false;

    let imeiList: string[] = [];

    // Only apply IMEI filtering if the user is not an account admin or super admin
    if (!isAccountAdmin && !isSuperAdmin) {
      imeiList = getUser[0]?.imeiList || [];

      // If imeiList is empty, extract IMEIs from the user's deviceGroup
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

      // If there are still no IMEIs associated with the user, return an empty result
      if (!imeiList.length) {
        return [];
      }
    }

    const start = convertISTToUTC(payload.startDate);
    const end = convertISTToUTC(payload.endDate);

    // Create a Flux query for fetching the distance data
    const fluxQuery = `
      from(bucket: "${payload.accountId}")
        |> range(start: ${start}, stop: ${end})
        |> filter(fn: (r) => r["_measurement"] == "track")
        ${
          !isAccountAdmin && !isSuperAdmin && imeiList.length
            ? `|> filter(fn: (r) => r["imei"] == "${imeiList.join(
                '" or r["imei"] == "'
              )}" )`
            : ''
        }
        |> filter(fn: (r) => r["_field"] == "latitude" or r["_field"] == "longitude" or r["_field"] == "imei")
        |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
    `;

    const data: { [key: string]: { imei: string; coordinates: any[] } } = {};

    for await (const { values } of this.influxDbService.executeQuery(
      fluxQuery
    )) {
      const [t0, t1, t2, t3, t4, t5, imei, lat, long] = values;

      if (!data[imei]) {
        data[imei] = { imei, coordinates: [] };
      }

      data[imei].coordinates.push({
        latitude: lat,
        longitude: long,
        time: t2,
      });
    }

    return Object.values(data);
  }

  async distanceTripReport(payload: DistanceTripReportInputType) {
    if (!payload.accountId) {
      return [];
    }

    const start = convertISTToUTC(payload.startDate);
    const end = convertISTToUTC(payload.endDate);

    // Create a Flux query for fetching the distance data
    const fluxQuery = `
      from(bucket: "${payload.accountId}")
        |> range(start: ${start}, stop: ${end})
        |> filter(fn: (r) => r["_measurement"] == "track")
        |> filter(fn: (r) => r["imei"] == ${payload.imei})
        |> filter(fn: (r) => r["_field"] == "latitude" or r["_field"] == "longitude" or r["_field"] == "imei")
        |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
    `;

    const data: { [key: string]: { imei: string; coordinates: any[] } } = {};

    for await (const { values } of this.influxDbService.executeQuery(
      fluxQuery
    )) {
      const [t0, t1, t2, t3, t4, t5, imei, lat, long] = values;

      if (!data[imei]) {
        data[imei] = { imei, coordinates: [] };
      }

      data[imei].coordinates.push({
        latitude: lat,
        longitude: long,
        time: t2,
      });
    }

    return Object.values(data);
  }

  async distanceTrackPlay(payload: DistanceTrackPlayInputType) {
    // Create a Flux query for fetching the distance data
    let startDate = new Date(payload.startDate);
    let endDate = new Date(payload.endDate);

    // Validate and swap if necessary
    if (startDate > endDate) {
      // Swap the dates
      [startDate, endDate] = [endDate, startDate];
    }

    const fluxQuery = `
      from(bucket: "${payload.accountId}")
         |> range(start: ${startDate.toISOString()}, stop: ${endDate.toISOString()})
         |> filter(fn: (r) => r["_measurement"] == "track")
         |> filter(fn: (r) => r["imei"] == "${payload.imei}")
         |> filter(fn: (r) => r["_field"] == "speed" or r["_field"] == "latitude" or r["_field"] == "longitude" or r["_field"] == "bearing")
         |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
    `;

    const rowData = [];

    for await (const { values } of this.influxDbService.executeQuery(
      fluxQuery
    )) {
      const [t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10] = values;
      rowData.push({
        time: t2,
        imei: t6,
        latitude: t8,
        longitude: t9,
        bearing: t7,
        speed: t10,
      });
    }

    return rowData;
  }

  async allDeviceMapView(payload: MapViewInputType, loggedInUser: any) {
    // Fetch the logged-in user object
    if (!payload.accountId) {
      return [];
    }

    const getUser = await this.userService.fetchUserByUserId(
      loggedInUser?.userId?.toString()
    );

    // Check the admin flags
    const isAccountAdmin = getUser[0]?.isAccountAdmin || false;
    const isSuperAdmin = getUser[0]?.isSuperAdmin || false;

    let imeiList: string[] = [];

    // Only apply IMEI filtering if the user is not an account admin or super admin
    if (!isAccountAdmin && !isSuperAdmin) {
      imeiList = getUser[0]?.imeiList || [];

      // If imeiList is empty, extract IMEIs from the user's deviceGroup
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

      // If there are still no IMEIs associated with the user, return an empty result
      if (!imeiList.length) {
        return [];
      }
    }
    const now = new Date();
    const oneHourAgo = new Date(
      now.getTime() - 1 * 60 * 60 * 1000
    ).toISOString();

    // Create a Flux query for fetching the distance data
    const fluxQuery = `
      from(bucket: "${payload.accountId}")
         |> range(start: ${oneHourAgo},stop: now()) 
        |> filter(fn: (r) => r["_measurement"] == "track")
        ${
          !isAccountAdmin && !isSuperAdmin && imeiList.length
            ? `|> filter(fn: (r) => r["imei"] == "${imeiList.join(
                '" or r["imei"] == "'
              )}" )`
            : ''
        }
        |> filter(fn: (r) => r["_field"] == "latitude" or r["_field"] == "longitude" or r["_field"] == "imei")
        |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> sort(columns: ["_time"], desc: true)
        |> limit(n: 1)
    `;

    const data: any[] = [];

    for await (const { values } of this.influxDbService.executeQuery(
      fluxQuery
    )) {
      const [t0, t1, t2, t3, t4, t5, imei, lat, long] = values;

      data.push({
        latitude: lat,
        longitude: long,
        imei,
        time: t2,
      });
    }

    return data;
  }
}
