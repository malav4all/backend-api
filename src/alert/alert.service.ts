import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AlertDocument, Alert } from './entity/alert.entity';
import { AlertInput, CreateAlertInputType } from './dto/create-alert.input';
import { RedisService } from '@imz/redis/redis.service';
import { UpdateAlertInput } from './dto/update-alert';
import { MqttService } from '@imz/mqtt/mqtt.service';
import { MqttClient } from 'mqtt';
import { PubSub } from 'graphql-subscriptions';
import axios from 'axios';

@Injectable()
export class AlertService {
  private mqttClient: MqttClient;
  private pubSub: PubSub = new PubSub();
  private logger = new Logger('AlertService');
  constructor(
    @InjectModel(Alert.name)
    private AlertModel: Model<AlertDocument>,
    private readonly redisService: RedisService,
    private readonly mqttService: MqttService
  ) {
    this.mqttClient = this.mqttService.getClient();
    this.mqttClient.on('message', async (topic, message) => {
      const messageString = Buffer.from(message).toString('utf8');
      const messageObject = JSON.parse(messageString);
      const redisClient = this.redisService.getClient();
      const getObject = await redisClient.get(messageObject.imei);
      const finalObject = JSON.parse(getObject);
      this.pubSub.publish('alertUpdated', {
        alertUpdated: messageObject,
      });
      if (
        finalObject &&
        finalObject.alertConfig &&
        finalObject.isAlertDisable
      ) {
        const { mobileNo, alertConfig } = finalObject;
        for (const alert of alertConfig.alertData) {
          if (alert.event === messageObject.event) {
            if (alert.isAlreadyGenerateAlert) continue;

            const { startDate, endDate, startAlertTime, endAlertTime } = alert;
            const now = new Date();

            // Check if startDate and endDate are present
            if (startDate && endDate) {
              const startDateTime = new Date(startDate);
              const endDateTime = new Date(endDate);
              if (now >= startDateTime && now <= endDateTime) {
                alert.isAlreadyGenerateAlert = true;
                const smsMessage =
                  alert.event === 'locked' ? 'locked' : 'Unlocked';
                await this.sendOtp(mobileNo, smsMessage);
                break;
              }
            }

            // Check if startAlertTime and endAlertTime are present
            if (startAlertTime && endAlertTime) {
              const startTime = new Date(startAlertTime);
              const endTime = new Date(endAlertTime);
              startTime.setFullYear(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
              );
              endTime.setFullYear(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
              );
              if (now >= startTime && now <= endTime) {
                alert.isAlreadyGenerateAlert = true;
                const smsMessage =
                  alert.event === 'locked' ? 'locked' : 'Unlocked';
                await this.sendOtp(mobileNo, smsMessage);
                break;
              }
            }
          }
        }
      }
      await this.redisService
        .getClient()
        .set(messageObject.imei, JSON.stringify(finalObject));
    });
  }

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

  async create(payload: CreateAlertInputType) {
    try {
      const existingRecord = await this.AlertModel.findOne({
        alertName: payload.alertName,
      });
      if (existingRecord) {
        throw new Error('Record Already Exits');
      }
      const record = await this.AlertModel.create(payload);
      const imeisToIterate =
        record.alertConfig.alertImeiGroup.imei ||
        record.alertConfig.userSelectedImei;

      for (const alert of imeisToIterate) {
        await this.setJsonValue(alert, record.alertConfig.alertData);
      }

      return record;
    } catch (error) {
      throw new Error(`Failed to create : ${error.message}`);
    }
  }

  async findAll(input: AlertInput) {
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const records = await this.AlertModel.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      const count = await this.AlertModel.count().exec();
      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(payload: UpdateAlertInput) {
    try {
      const updatePayload = {
        ...payload,
        updatedAt: new Date(),
      };
      const record = await this.AlertModel.findByIdAndUpdate(
        payload._id,
        updatePayload,
        {
          new: true,
        }
      )
        .lean()
        .exec();
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
