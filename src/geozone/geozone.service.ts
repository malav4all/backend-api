import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { GeozoneDocument, Geozone } from './enitity/geozone.entity';
import { Model } from 'mongoose';
import { CreateGeoZoneInput, GeozoneInput } from './dto/create-geozone.input';
import { UpdateGeozoneInput } from './dto/update-geozone.input';
import { MqttClient } from 'mqtt';
import { PubSub } from 'graphql-subscriptions';
import { RedisService } from '@imz/redis/redis.service';
import { MqttService } from '@imz/mqtt/mqtt.service';
import { getDistanceInMeters } from '@imz/helper/generateotp';
import axios from 'axios';

@Injectable()
export class GeozoneService {
  private mqttClient: MqttClient;
  private pubSub: PubSub = new PubSub();
  private logger = new Logger('GeoService');
  constructor(
    @InjectModel(Geozone.name)
    private GeoZoneModel: Model<GeozoneDocument>,
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
      this.pubSub.publish('coordinatesUpdated', {
        coordinatesUpdated: messageObject,
      });
      if (
        finalObject &&
        finalObject.alertConfig &&
        finalObject.alertConfig.alertData &&
        finalObject.isAlertDisable
      ) {
        const { mobileNo, alertConfig } = finalObject;

        for (const alert of alertConfig.alertData) {
          const { event, location } = alert;
          const { coordinates, radius } = location.geoCodeData.geometry;
          const distanceInMeters = getDistanceInMeters(
            { latitude: coordinates[0], longitude: coordinates[1] },
            { latitude: messageObject.lat, longitude: messageObject.lng }
          );

          if (alert.isAlreadyGenerateAlert) continue;

          const isVehicleInGeozone =
            event === 'geo_in' && distanceInMeters <= radius;
          if (
            isVehicleInGeozone ||
            (event === 'geo_out' && distanceInMeters > radius)
          ) {
            alert.isAlreadyGenerateAlert = true;
            const message = isVehicleInGeozone
              ? 'Your car is within the geozone'
              : 'Your car is outside the geozone';
            await this.sendOtp(mobileNo, message);
            break;
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

  async create(payload: CreateGeoZoneInput) {
    try {
      const existingCircleName = await this.GeoZoneModel.findOne({
        name: payload.name,
      });
      if (existingCircleName) {
        throw new Error('Record Already Exits');
      }

      const record = await this.GeoZoneModel.create({
        ...payload,
      });
      return record;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async fetchGeozone(input: GeozoneInput) {
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const records = await this.GeoZoneModel.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      const count = await this.GeoZoneModel.count().exec();
      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(payload: UpdateGeozoneInput) {
    try {
      const updatePayload = {
        ...payload,
        updatedAt: new Date(),
      };
      const record = await this.GeoZoneModel.findByIdAndUpdate(
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

  coordinatesUpdated(topic: string) {
    this.mqttClient.subscribe(topic, (err) => {
      if (err) {
        this.logger.error('Error subscribing to topic:', err);
      } else {
        this.logger.log('Subscribed to topic:', topic);
      }
    });

    return this.pubSub.asyncIterator('coordinatesUpdated');
  }
}
