import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AlertDocument, Alert } from './entity/alert.entity';
import { AlertInput, CreateAlertInputType } from './dto/create-alert.input';
import { RedisService } from '@imz/redis/redis.service';
import { UpdateAlertInput } from './dto/update-alert';

@Injectable()
export class AlertService {
  constructor(
    @InjectModel(Alert.name)
    private AlertModel: Model<AlertDocument>,
    private readonly redisService: RedisService
  ) {}

  async setJsonValue(key: string, value: any): Promise<void> {
    const redisClient = this.redisService.getClient();
    await redisClient.set(key, JSON.stringify(value));
  }

  async create(payload: CreateAlertInputType) {
    try {
      const existingRecord = await this.AlertModel.findOne({
        'alertConfig.imei': payload.alertConfig.imei,
      });
      if (existingRecord) {
        throw new Error('Record Already Exits');
      }
      const record = await this.AlertModel.create(payload);
      await this.setJsonValue(payload.alertConfig.imei, record);
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
}
