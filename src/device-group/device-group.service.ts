import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { DeviceGroup, DeviceGroupSchema } from './entities/device-group.entity';
import { Connection, Model } from 'mongoose';
import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  CreateDeviceGroupInput,
  DeviceGroupInput,
  SearchDeviceGroupInput,
  SearchImeiDataInput,
} from './dto/create-device-group.input';
import { UpdateDeviceGroupInput } from './dto/update-device-group.input';

export class DeviceGroupService {
  constructor(
    @InjectConnection()
    private connection: Connection
  ) {}

  async getTenantModel<T>(
    tenantId: string,
    modelName: string,
    schema: any
  ): Promise<Model<T>> {
    const tenantConnection = await this.connection.useDb(`tenant_${tenantId}`);
    return tenantConnection.model(modelName, schema);
  }

  async create(payload: CreateDeviceGroupInput) {
    try {
      const deviceGroupModel = await this.getTenantModel<DeviceGroup>(
        payload.accountId,
        DeviceGroup.name,
        DeviceGroupSchema
      );
      const existingRecord = await deviceGroupModel.findOne({
        deviceGroupName: payload.deviceGroupName,
      });
      if (existingRecord) {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }
      const record = await deviceGroupModel.create({ ...payload });
      return record;
    } catch (error) {
      throw new Error(`Failed to create:${error.message}`);
    }
  }

  async findAllDeviceGroupsWithImeis(input: DeviceGroupInput) {
    try {
      const deviceGroupModel = await this.getTenantModel<DeviceGroup>(
        input.accountId,
        DeviceGroup.name,
        DeviceGroupSchema
      );
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;
      const records = await deviceGroupModel
        ?.find({})
        ?.sort({ createdAt: -1 })
        ?.skip(skip)
        ?.limit(limit)
        .populate({ path: 'imeiData' })
        ?.exec();
      const count = await deviceGroupModel.countDocuments().exec();
      return { count, records };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async searchDeviceGroup(input: SearchDeviceGroupInput) {
    try {
      const deviceGroupModel = await this.getTenantModel<DeviceGroup>(
        input.accountId,
        DeviceGroup.name,
        DeviceGroupSchema
      );
      const page = Number(input.page) || 1;
      const limit = Number(input.limit) || 10;
      const skip = page === -1 ? 0 : (page - 1) * limit;
      const records = await deviceGroupModel
        .find({
          $or: [
            { deviceGroupName: { $regex: input.search, $options: 'i' } },
            { createdBy: { $regex: input.search, $options: 'i' } },
          ],
        })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
      const count = await deviceGroupModel.countDocuments({
        $or: [
          { deviceGroupName: { $regex: input.search, $options: 'i' } },
          { createdBy: { $regex: input.search, $options: 'i' } },
        ],
      });

      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(payload: UpdateDeviceGroupInput) {
    try {
      const deviceGroupModel = await this.getTenantModel<DeviceGroup>(
        payload.accountId,
        DeviceGroup.name,
        DeviceGroupSchema
      );
      const updatePayload = {
        ...payload,
        updatedAt: new Date(),
      };
      const record = await deviceGroupModel
        .findByIdAndUpdate(payload._id, updatePayload, {
          new: true,
        })
        .lean()
        .exec();
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async fetchDeviceGroupById(input: DeviceGroupInput) {
    const deviceGroupModel = await this.getTenantModel<DeviceGroup>(
      input.accountId,
      DeviceGroup.name,
      DeviceGroupSchema
    );
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const [records, count] = await Promise.all([
        deviceGroupModel.aggregate([
          {
            $match: {
              $expr: {
                $eq: [
                  '$_id',
                  {
                    $convert: {
                      input: input.id,
                      to: 'objectId',
                    },
                  },
                ],
              },
            },
          },
          {
            $lookup: {
              from: 'assertassingmentmoduleentities',
              localField: 'imeiData',
              foreignField: '_id',
              as: 'imeiData',
            },
          },
          {
            $unwind: {
              path: '$imeiData',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'journeys',
              localField: 'imeiData.journey',
              foreignField: '_id',
              as: 'imeiData.journey',
            },
          },
          {
            $unwind: {
              path: '$imeiData.journey',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $group: {
              _id: '$_id',
              createdBy: { $first: '$createdBy' },
              deviceGroupName: { $first: '$deviceGroupName' },
              imeiData: {
                $push: {
                  imei: '$imeiData.imei',
                  labelName: '$imeiData.labelName',
                  _id: '$imeiData._id',
                  boxSet: '$imeiData.boxSet',
                  journey: {
                    _id: '$imeiData.journey._id',
                    totalDuration: '$imeiData.journey.totalDuration',
                    totalDistance: '$imeiData.journey.totalDistance',
                    endDate: '$imeiData.journey.endDate',
                    startDate: '$imeiData.journey.startDate',
                    createdBy: '$imeiData.journey.createdBy',
                    journeyName: '$imeiData.journey.journeyName',
                  },
                },
              },
              countImeiData: { $sum: 1 }, // Count of imeiData
            },
          },
          {
            $project: {
              _id: 1,
              createdBy: 1,
              deviceGroupName: 1,
              imeiData: { $slice: ['$imeiData', skip, limit] },
              countImeiData: 1, // Include the count field
            },
          },
        ]),
        deviceGroupModel.aggregate([
          // New aggregation pipeline to get count of imeiData
          {
            $match: {
              $expr: {
                $eq: [
                  '$_id',
                  {
                    $convert: {
                      input: input.id,
                      to: 'objectId',
                    },
                  },
                ],
              },
            },
          },
          {
            $lookup: {
              from: 'assertassingmentmoduleentities',
              localField: 'imeiData',
              foreignField: '_id',
              as: 'imeiData',
            },
          },
          {
            $unwind: {
              path: '$imeiData',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $group: {
              _id: '$_id',
              countImeiData: { $sum: 1 }, // Count of imeiData
            },
          },
        ]),
      ]);

      // Extracting count from the second aggregation result
      const imeiDataCount = count.length > 0 ? count[0].countImeiData : 0;

      return { count: imeiDataCount, records };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async searchImeiData(input: SearchImeiDataInput) {
    try {
      const deviceGroupModel = await this.getTenantModel<DeviceGroup>(
        input.accountId,
        DeviceGroup.name,
        DeviceGroupSchema
      );
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      // Construct the search query

      const recordsPipeline = [
        {
          $lookup: {
            from: 'assertassingmentmoduleentities',
            localField: 'imeiData',
            foreignField: '_id',
            as: 'imeiData',
          },
        },
        {
          $unwind: {
            path: '$imeiData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'journeys',
            localField: 'imeiData.journey',
            foreignField: '_id',
            as: 'imeiData.journey',
          },
        },
        {
          $unwind: {
            path: '$imeiData.journey',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            $or: [
              {
                'imeiData.imei': isNaN(Number(input.search))
                  ? undefined
                  : Number(input.search),
              },
              {
                'imeiData.labelName': { $regex: input.search, $options: 'i' },
              },
            ],
          },
        },
        {
          $group: {
            _id: '$_id',
            createdBy: { $first: '$createdBy' },
            deviceGroupName: { $first: '$deviceGroupName' },
            imeiData: {
              $push: {
                imei: '$imeiData.imei',
                labelName: '$imeiData.labelName',
                _id: '$imeiData._id',
                boxSet: '$imeiData.boxSet',
                journey: {
                  _id: '$imeiData.journey._id',
                  totalDuration: '$imeiData.journey.totalDuration',
                  totalDistance: '$imeiData.journey.totalDistance',
                  endDate: '$imeiData.journey.endDate',
                  startDate: '$imeiData.journey.startDate',
                  createdBy: '$imeiData.journey.createdBy',
                  journeyName: '$imeiData.journey.journeyName',
                },
              },
            },
            countImeiData: { $sum: 1 }, // Count of imeiData
          },
        },
        {
          $project: {
            _id: 1,
            createdBy: 1,
            deviceGroupName: 1,
            imeiData: { $slice: ['$imeiData', skip, limit] },
            countImeiData: 1, // Include the count field
          },
        },
      ];

      const countPipeline = [
        {
          $lookup: {
            from: 'assertassingmentmoduleentities',
            localField: 'imeiData',
            foreignField: '_id',
            as: 'imeiData',
          },
        },
        {
          $unwind: {
            path: '$imeiData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            $or: [
              {
                'imeiData.imei': isNaN(Number(input.search))
                  ? undefined
                  : Number(input.search),
              },
              {
                'imeiData.labelName': { $regex: input.search, $options: 'i' },
              },
            ],
          },
        },
        {
          $group: {
            _id: '$_id',
            countImeiData: { $sum: 1 }, // Count of imeiData
          },
        },
      ];

      const [records, count] = await Promise.all([
        deviceGroupModel.aggregate(recordsPipeline),
        deviceGroupModel.aggregate(countPipeline),
      ]);

      const imeiDataCount = count.length > 0 ? count[0].countImeiData : 0;

      return { count: imeiDataCount, records };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
