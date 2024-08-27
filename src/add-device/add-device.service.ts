import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
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
        throw new ConflictException(
          `A record with the IMEI "${payload.imei}" already exists in the system. Please use a unique IMEI.`
        );
      }

      const record = await this.AddDeviceModel.create({
        ...payload,
      });
      return record;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Failed to create: ${error.message}`);
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
  async bulkDeviceUpload(payload: CreateAddDeviceInput[]) {
    const payloadLength = payload.length;
    const defaultBatchSize = 1000;
    const maxBatchSize = 10000;

    // Calculate batch size dynamically
    const batchSize =
      Math.min(Math.ceil(payloadLength / 10), maxBatchSize) || defaultBatchSize;

    const results: AddDevice[] = [];
    let totalDuplicates = 0;

    try {
      for (let i = 0; i < payloadLength; i += batchSize) {
        const batch = payload.slice(i, i + batchSize);

        // Extract IMEIs from the batch
        const imeis = batch.map((device) => device.imei);

        // Find existing IMEIs in the database
        const existingDevices = await this.AddDeviceModel.find({
          imei: { $in: imeis },
        }).select('imei');

        const existingImeis = existingDevices.map((device) => device.imei);

        // Filter out the records with IMEIs that already exist in the database
        const filteredBatch = batch.filter(
          (device) => !existingImeis.includes(device.imei)
        );

        // Count duplicates
        totalDuplicates += batch.length - filteredBatch.length;

        // Insert the filtered batch
        if (filteredBatch.length > 0) {
          const record = await this.AddDeviceModel.insertMany(filteredBatch);
          results.push(...record);
        }
      }

      return {
        successCount: results.length,
        duplicateCount: totalDuplicates,
        data: results,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
