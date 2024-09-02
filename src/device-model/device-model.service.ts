import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  DeviceModelDocument,
  DeviceModel,
} from './entities/device-model.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateDeviceModelInput } from './dto/update-device-model.input';
import {
  CreateDeviceModelInput,
  DeviceModelInput,
  SearchDeviceModel,
  checkDeviceModelInput,
} from './dto/create-device-model.input';

@Injectable()
export class DeviceModelService {
  constructor(
    @InjectModel(DeviceModel.name)
    private DeviceModelModel: Model<DeviceModelDocument>
  ) {}

  async count() {
    return await this.DeviceModelModel.count().exec();
  }

  async findAll(input: DeviceModelInput) {
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);

      const skip = page === -1 ? 0 : (page - 1) * limit;
      const records = await this.DeviceModelModel.find()
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
      return records;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async create(payload: CreateDeviceModelInput) {
    try {
      const input = {
        ...payload,
        deviceId: `DM${payload?.deviceModel?.toLocaleUpperCase()}`,
      };

      const existingRecord = await this.DeviceModelModel.findOne({
        deviceId: input.deviceId,
      });

      if (existingRecord) {
        throw new Error('Record Already Exits');
      }

      const record = await this.DeviceModelModel.create(input);
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(payload: UpdateDeviceModelInput) {
    try {
      const updatePayload = {
        ...payload,
        lastUpdated: new Date(),
      };
      const record = await this.DeviceModelModel.findByIdAndUpdate(
        payload._id,
        updatePayload,
        {
          new: true,
        }
      ).exec();
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async softDelete(payload: UpdateDeviceModelInput) {
    try {
      const updatePayload = {
        ...payload,
        isDelete: true,
        lastUpdated: new Date(),
      };
      const record = await this.DeviceModelModel.findByIdAndUpdate(
        payload._id,
        updatePayload,
        {
          new: true,
        }
      ).exec();
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // async searchDeviceModel(input: SearchDeviceModel) {
  //   try {
  //     const page = Number(input.page);
  //     const limit = Number(input.limit);
  //     const skip = page === -1 ? 0 : (page - 1) * limit;

  //     const searchCriteria = {
  //       $or: [
  //         { deviceModelName: { $regex: input.search, $options: 'i' } },
  //         { deviceModel: { $regex: input.search, $options: 'i' } },
  //         { deviceModelType: { $regex: input.search, $options: 'i' } },
  //         { deviceModelIpAddress: { $regex: input.search, $options: 'i' } },
  //         { deviceModelPortNumber: { $regex: input.search, $options: 'i' } },
  //         { deviceModelSimCount: { $regex: input.search, $options: 'i' } },
  //         { deviceModelNetworkType: { $regex: input.search, $options: 'i' } },
  //       ],
  //     };

  //     const records = await this.DeviceModelModel.find(searchCriteria)
  //       .skip(skip)
  //       .limit(limit)
  //       .lean()
  //       .exec();

  //     const count = await this.DeviceModelModel.countDocuments(searchCriteria);

  //     return { records, count };
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  async searchDeviceModel(input: SearchDeviceModel) {
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const searchValue = input.search;

      // Create a search criteria array for string fields
      const searchCriteria: any[] = [
        { deviceId: { $regex: searchValue, $options: 'i' } },
        { deviceModelName: { $regex: searchValue, $options: 'i' } },
        { deviceModel: { $regex: searchValue, $options: 'i' } },
        { deviceModelType: { $regex: searchValue, $options: 'i' } },
        { deviceModelIpAddress: { $regex: searchValue, $options: 'i' } },
        { deviceModelNetworkType: { $regex: searchValue, $options: 'i' } },
      ];

      // Check if the searchValue is a number and add numeric fields to the search criteria
      if (!isNaN(Number(searchValue))) {
        const numericValue = Number(searchValue);
        searchCriteria.push(
          { deviceModelPortNumber: numericValue },
          { deviceModelSimCount: numericValue }
        );
      }

      const records = await this.DeviceModelModel.find({ $or: searchCriteria })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      const count = await this.DeviceModelModel.countDocuments({
        $or: searchCriteria,
      });

      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async checkExistsRecord(payload: checkDeviceModelInput) {
    try {
      const record = await this.DeviceModelModel.find({
        deviceModelName: {
          $in: [payload.deviceModelName?.split(' ')?.join('')],
        },
      })
        .lean()
        .exec();
      if (record.length === 0) {
        return undefined;
      }
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
