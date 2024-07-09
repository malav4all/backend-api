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
  CreateAlertInputType,
  SearchAlertInput,
} from './dto/create-alert.input';
import { RedisService } from '@imz/redis/redis.service';
import { UpdateAlertInput } from './dto/update-alert';
import { MqttClient } from 'mqtt';
import { PubSub } from 'graphql-subscriptions';
import axios from 'axios';

@Injectable()
export class AlertService {
  private mqttClient: MqttClient;
  private pubSub: PubSub = new PubSub();
  private logger = new Logger('AlertService');
  constructor(
    @InjectConnection()
    private connection: Connection,
    private readonly redisService: RedisService
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
    tenantId: string,
    modelName: string,
    schema: any
  ): Promise<Model<T>> {
    const tenantConnection = await this.connection.useDb(`tenant_${tenantId}`);
    return tenantConnection.model(modelName, schema);
  }

  async create(payload: CreateAlertInputType) {
    try {
      const alertModel = await this.getTenantModel<Alert>(
        payload.accountId,
        Alert.name,
        AlertSchema
      );
      const existingRecord = await alertModel.findOne({
        alertName: payload.alertName,
      });
      if (existingRecord) {
        throw new Error('Record Already Exits');
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
      throw new Error(`Failed to create : ${error.message}`);
    }
  }

  async searchAlert(input: SearchAlertInput) {
    try {
      const alertModel = await this.getTenantModel<Alert>(
        input.accountId,
        Alert.name,
        AlertSchema
      );
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

  alertUpdated(topic: string) {
    this.mqttClient.subscribe(topic, (err) => {
      if (err) {
        this.logger.error('Error subscribing to topic:', err);
      } else {
        this.logger.log('Subscribed to Alert topic:', topic);
      }
    });

    return this.pubSub.asyncIterator('alertUpdated');
  }
}
