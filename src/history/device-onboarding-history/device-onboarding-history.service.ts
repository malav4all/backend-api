import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DeviceOnboardingHistory,
  DeviceOnboardingHistoryDocument,
} from './enities/device-onboarding-history.enities';
import {
  DeviceOnboardingHistoryFetchInput,
  DeviceOnboardingHistoryInput,
} from './dto/create-device-oonboarding-history.input';
@Injectable()
export class DeviceOnboardingHistoryService {
  constructor(
    @InjectModel(DeviceOnboardingHistory.name)
    private DeviceOnboardingHistoryModel: Model<DeviceOnboardingHistoryDocument>
  ) {}

  async count() {
    return await this.DeviceOnboardingHistoryModel.count().exec();
  }

  async findAll(input: DeviceOnboardingHistoryFetchInput) {
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;
      const records = await this.DeviceOnboardingHistoryModel.find()
        .populate('deviceOnboardingAccount')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      return records;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async create(payload: DeviceOnboardingHistoryInput) {
    try {
      const record = await this.DeviceOnboardingHistoryModel.create(payload);

      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
