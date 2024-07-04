import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DeviceSimHistory,
  DeviceSimHistoryDocument,
} from './enitites/device-sim-history.entity';
import {
  DeviceSimHistoryFetchInput,
  DeviceSimHistoryInput,
} from './dto/create-device-sim-history';

@Injectable()
export class DeviceSimHistoryService {
  constructor(
    @InjectModel(DeviceSimHistory.name)
    private DeviceSimHistoryModel: Model<DeviceSimHistoryDocument>
  ) {}

  async count() {
    return await this.DeviceSimHistoryModel.count().exec();
  }

  async findAll(input: DeviceSimHistoryFetchInput) {
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;
      const records = await this.DeviceSimHistoryModel.find()
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
      return records;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async create(payload: DeviceSimHistoryInput) {
    try {
      const record = await this.DeviceSimHistoryModel.create(payload);
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
