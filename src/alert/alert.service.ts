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
  CreateAlertInputType,
  DistanceReportInputType,
  SearchAlertInput,
} from './dto/create-alert.input';
import { RedisService } from '@imz/redis/redis.service';
import { UpdateAlertInput } from './dto/update-alert';
import { MqttClient } from 'mqtt';
import { PubSub } from 'graphql-subscriptions';
import axios from 'axios';
import { InfluxdbService } from '@imz/influx-db/influx-db-.service';

@Injectable()
export class AlertService {
  private mqttClient: MqttClient;
  private pubSub: PubSub = new PubSub();
  private logger = new Logger('AlertService');

  constructor(
    @InjectConnection()
    private connection: Connection,
    private readonly redisService: RedisService,
    private influxDbService: InfluxdbService
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
    const redisClient = this.redisService.getClient();
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
      const imeisToIterate =
        record.alertConfig.alertImeiGroup.imei ||
        record.alertConfig.userSelectedImei;

      for (const alert of imeisToIterate) {
        await this.setJsonValue(alert, {
          mobileNo: record.mobileNo,
          alarmConfig: record.alertConfig.alertData,
        });
      }

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

  async fetchAlertReport(payload: AlertReportInputType) {
    const page = Number(payload.page);
    const limit = Number(payload.limit);
    const skip = page === -1 ? 0 : (page - 1) * limit;

    const countQuery = `
    from(bucket: "${payload.accountId}")
      |> range(start: ${payload.startDate}, stop: ${payload.endDate})
      |> filter(fn: (r) => r["_measurement"] == "alert")
      |> count()
  `;
    const countResponse: any = await this.influxDbService.countQuery(
      countQuery
    );
    const totalCount = countResponse[0]._value;

    const query = `
      from(bucket: "${payload.accountId}")
        |> range(start: ${payload.startDate}, stop: ${payload.endDate})
        |> filter(fn: (r) => r["_measurement"] == "alert")
        |> filter(fn: (r) => r["_field"] == "imei" or r["_field"] == "latitude" or r["_field"] == "longitude" or r["_field"] == "alertMessage" or r["_field"] == "accountId" or r["_field"] == "label")
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

  async distanceReport(payload: DistanceReportInputType) {
    const fluxQuery = `
    from(bucket: "${payload.accountId}")
      |> range(start: ${payload.startDate}, stop: ${payload.endDate})
      |> filter(fn: (r) => r["_measurement"] == "track")
      |> filter(fn: (r) => r["_field"] == "latitude" or r["_field"] == "longitude" or r["_field"] == "imei")
      |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
     `;

    const data = {};

    for await (const { values } of this.influxDbService.executeQuery(
      fluxQuery
    )) {
      // console.log(values);
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
}
