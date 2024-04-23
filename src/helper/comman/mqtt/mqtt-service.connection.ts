import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { connect, MqttClient } from 'mqtt';
import { PubSub } from 'graphql-subscriptions';
import { RedisService } from '@imz/redis/redis.service';
import axios from 'axios';
import { getDistance } from 'geolib';
import { getDistanceInMeters } from '@imz/helper/generateotp';

@Injectable()
export class MqttService {
  private client: MqttClient;
  private pubSub: PubSub = new PubSub();
  private logger = new Logger('MqttConnection');

  constructor(private readonly _redisService: RedisService) {
    this.client = connect('mqtt://103.20.214.75:1883', {
      clientId: 'malav_web_app',
      username: 'malav',
      password: 'malav@123',
    });

    this.client.on('connect', () => {
      this.logger.log('Connected MQTT Server');
    });

    this.client.on('message', async (topic, message) => {
      const [first, second] = topic.split('/');
      const messageString = Buffer.from(message).toString('utf8');
      const messageObject = JSON.parse(messageString);
      const redisClient = this._redisService.getClient();
      const getObject = await redisClient.get(messageObject.imei);
      const finalObject = JSON.parse(getObject);
      if (first === 'alerts') {
        this.pubSub.publish('alertUpdated', {
          alertUpdated: messageObject,
        });
        if (finalObject && finalObject.alertConfig) {
          const { mobileNo, alertConfig } = finalObject;
          for (const alert of alertConfig.alertData) {
            if (alert.event === messageObject.event) {
              const startDate = new Date(alert.startDate);
              const endDate = new Date(alert.endDate);
              if (alert.event === 'locked') {
                if (
                  new Date().getTime() >= startDate.getTime() &&
                  new Date().getTime() <= endDate.getTime()
                ) {
                  const smsMessage = `Your car is within the geozone`;
                  await this.sendOtp(mobileNo, smsMessage);
                }
              } else if (alert.event === 'unlocked') {
                if (
                  new Date().getTime() >= startDate.getTime() &&
                  new Date().getTime() <= endDate.getTime()
                ) {
                  const smsMessage = `Your car is within the geozone`;
                  await this.sendOtp(mobileNo, smsMessage);
                }
              }
            }
          }
        }
      } else if (first === 'track') {
        this.pubSub.publish('coordinatesUpdated', {
          coordinatesUpdated: messageObject,
        });
        if (finalObject && finalObject.alertConfig) {
          const { mobileNo, alertConfig } = finalObject;
          for (let i = 0; i < alertConfig?.alertData?.length; i++) {
            const alert = finalObject.alertConfig.alertData[i];
            const { event, location } = alert;
            const { coordinates, radius } = location.geoCodeData.geometry;
            const distanceInMeters = getDistanceInMeters(
              {
                latitude: coordinates[0],
                longitude: coordinates[1],
              },
              {
                latitude: messageObject.lat,
                longitude: messageObject.lng,
              }
            );

            if (
              event === 'geo_in' &&
              distanceInMeters <= radius &&
              !finalObject.alertConfig.alertData[i].isAlreadyGenerateAlert
            ) {
              finalObject.alertConfig.alertData[i].isAlreadyGenerateAlert =
                true;
              await this.sendOtp(mobileNo, 'Your car is within the geozone');
              break;
            } else if (
              event === 'geo_out' &&
              distanceInMeters > radius &&
              !finalObject.alertConfig.alertData[i].isAlreadyGenerateAlert
            ) {
              finalObject.alertConfig.alertData[i].isAlreadyGenerateAlert =
                true;
              await this.sendOtp(mobileNo, 'Your car is outside the geozone');
              break;
            } else if (
              event === 'geo_in' &&
              distanceInMeters <= radius &&
              finalObject.alertConfig.alertData[i].isAlreadyGenerateAlert
            ) {
              break;
            }
          }
          await this._redisService
            .getClient()
            .set(messageObject.imei, JSON.stringify(finalObject));
        }
      }
    });

    this.client.on('error', (err) => {
      this.logger.error(err);
    });
  }

  coordinatesUpdated(topic: string) {
    this.client.subscribe(topic, (err) => {
      if (err) {
        this.logger.error('Error subscribing to topic:', err);
      } else {
        this.logger.log('Subscribed to topic:', topic);
      }
    });

    return this.pubSub.asyncIterator('coordinatesUpdated');
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

  alertUpdated(topic: string) {
    this.client.subscribe(topic, (err) => {
      if (err) {
        this.logger.error('Error subscribing to topic:', err);
      } else {
        this.logger.log('Subscribed to Alert topic:', topic);
      }
    });

    return this.pubSub.asyncIterator('alertUpdated');
  }
}
