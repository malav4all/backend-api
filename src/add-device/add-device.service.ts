import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { AddDevice, AddDeviceDocument } from './entity/add-device.entity';
import {
  AddDeviceInput,
  CreateAddDeviceInput,
  SearchAddDeviceInput,
} from './dto/add-device.input';
import { UpdateAddDeviceInput } from './dto/update.add-device.input';

@Injectable()
export class AddDeviceService {
  constructor(
    @InjectModel(AddDevice.name)
    private AddDeviceModel: Model<AddDeviceDocument>
  ) {}

  async create(payload: CreateAddDeviceInput) {
    try {
      const existingRecord = await this.AddDeviceModel.findOne({
        imei: payload.imei,
      });
      if (existingRecord) {
        throw new Error('Record Already Exits');
      }

      const record = await this.AddDeviceModel.create({
        ...payload,
      });
      return record;
    } catch (error) {
      throw new Error(`Failed to create : ${error.message}`);
    }
  }

  async findAll(input: AddDeviceInput) {
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const records = await this.AddDeviceModel.aggregate([
        {
          $lookup: {
            from: 'devicemodels',
            localField: 'deviceModelCode',
            foreignField: 'deviceId',
            as: 'deviceModelDetails',
          },
        },
        {
          $unwind: {
            path: '$deviceModelDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
        {
          $project: {
            _id: 1,
            createdBy: 1,
            deviceModelCode: 1,
            imei: 1,
            createdAt: 1,
            updatedAt: 1,
            __v: 1,
            deviceModelName: {
              $ifNull: ['$deviceModelDetails.deviceModelName', null],
            },
            deviceModelType: {
              $ifNull: ['$deviceModelDetails.deviceModelType', null],
            },
            deviceId: { $ifNull: ['$deviceModelDetails.deviceId', null] },
          },
        },
      ]);

      const count = await this.AddDeviceModel.countDocuments({
        deviceModelCode: { $exists: true, $ne: null },
      }).exec();

      return { records, count };
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async searchDeviceList(input: SearchAddDeviceInput) {
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      // Create search criteria for the $or condition
      const searchCriteria = {
        $or: [
          { imei: { $regex: input.search, $options: 'i' } },
          {
            'deviceModelDetails.deviceId': {
              $regex: input.search,
              $options: 'i',
            },
          },
          {
            'deviceModelDetails.deviceModelType': {
              $regex: input.search,
              $options: 'i',
            },
          },
          {
            'deviceModelDetails.deviceModelName': {
              $regex: input.search,
              $options: 'i',
            },
          },
        ],
      };

      // Perform lookup and unwind in aggregation
      const records = await this.AddDeviceModel.aggregate([
        {
          $lookup: {
            from: 'devicemodels',
            localField: 'deviceModelCode',
            foreignField: 'deviceId',
            as: 'deviceModelDetails',
          },
        },
        {
          $unwind: {
            path: '$deviceModelDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: searchCriteria,
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
        {
          $project: {
            _id: 1,
            createdBy: 1,
            deviceModelCode: 1,
            imei: 1,
            createdAt: 1,
            updatedAt: 1,
            __v: 1,
            deviceModelName: {
              $ifNull: ['$deviceModelDetails.deviceModelName', null],
            },
            deviceModelType: {
              $ifNull: ['$deviceModelDetails.deviceModelType', null],
            },
            deviceId: { $ifNull: ['$deviceModelDetails.deviceId', null] },
          },
        },
      ]);

      // Count documents matching the search criteria
      const count = await this.AddDeviceModel.aggregate([
        {
          $lookup: {
            from: 'devicemodels',
            localField: 'deviceModelCode',
            foreignField: 'deviceId',
            as: 'deviceModelDetails',
          },
        },
        {
          $unwind: {
            path: '$deviceModelDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: searchCriteria,
        },
        {
          $count: 'totalCount',
        },
      ]);

      return { records, count: count[0] ? count[0].totalCount : 0 };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(payload: UpdateAddDeviceInput) {
    try {
      const updatePayload = {
        ...payload,
        lastUpdated: new Date(),
      };
      const record = await this.AddDeviceModel.findByIdAndUpdate(
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

  async bulkDeviceUpload(
    payload: CreateAddDeviceInput[]
  ): Promise<AddDevice[]> {
    const payloadLength = payload.length;
    const defaultBatchSize = 1000;
    const maxBatchSize = 10000;

    // Calculate batch size dynamically
    const batchSize =
      Math.min(Math.ceil(payloadLength / 10), maxBatchSize) || defaultBatchSize;
    const results = [];

    try {
      for (let i = 0; i < payloadLength; i += batchSize) {
        const batch = payload.slice(i, i + batchSize);
        const record = await this.AddDeviceModel.insertMany(batch);
        results.push(...record);
      }
      return results;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
