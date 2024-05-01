import { InjectModel } from '@nestjs/mongoose';
import {
  DeviceGroup,
  DeviceGroupDocument,
} from './entities/device-group.entity';
import { Model } from 'mongoose';
import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  CreateDeviceGroupInput,
  DeviceGroupInput,
  SearchDeviceGroupInput,
} from './dto/create-device-group.input';
import { UpdateDeviceGroupInput } from './dto/update-device-group.input';
import {
  AssertAssingmentModuleDocument,
  AssertAssingmentModuleEntity,
} from '@imz/assert-asingment/entities/assert-asingment.enitiy';
import { ObjectID } from 'typeorm';
export class DeviceGroupService {
  constructor(
    @InjectModel(DeviceGroup.name)
    private DeviceGroupModel: Model<DeviceGroupDocument>,
    @InjectModel(AssertAssingmentModuleEntity.name)
    private AssertAssingmentModuleModule: Model<AssertAssingmentModuleDocument>
  ) {}

  async create(payload: CreateDeviceGroupInput) {
    try {
      const existingRecord = await this.DeviceGroupModel.findOne({
        deviceGroupName: payload.deviceGroupName,
      });
      if (existingRecord) {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }
      const record = await this.DeviceGroupModel.create({ ...payload });
      return record;
    } catch (error) {
      throw new Error(`Failed to create:${error.message}`);
    }
  }

  async findAllDeviceGroupsWithImeis(input: DeviceGroupInput) {
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;
      const records = await this?.DeviceGroupModel?.find({})
        ?.sort({ createdAt: -1 })
        ?.skip(skip)
        ?.limit(limit)
        .populate({ path: 'imeiData' })
        ?.exec();
      const count = await this.DeviceGroupModel.countDocuments().exec();
      return { count, records };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async searchDeviceGroup(input: SearchDeviceGroupInput) {
    try {
      const page = Number(input.page) || 1;
      const limit = Number(input.limit) || 10;
      const skip = page === -1 ? 0 : (page - 1) * limit;
      const records = await this.DeviceGroupModel.find({
        $or: [
          { deviceGroupName: { $regex: input.search, $options: 'i' } },
          { createdBy: { $regex: input.search, $options: 'i' } },
        ],
      })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
      const count = await this.DeviceGroupModel.countDocuments({
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
      const updatePayload = {
        ...payload,
        updatedAt: new Date(),
      };
      const record = await this.DeviceGroupModel.findByIdAndUpdate(
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

  async fetchDeviceGroupById(input:DeviceGroupInput){
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const pipeline = [
        {
          $match: {
              _id: new ObjectID("6630df2f9753a45614d87cfe")  
          }
      },
        ,{
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
              _id: "$_id",
              createdBy: { $first: "$createdBy" },
              deviceGroupName: { $first: "$deviceGroupName" },
              imeiData: {
                  $push: {
                      imei: "$imeiData.imei",
                      labelName: "$imeiData.labelName",
                      _id: "$imeiData._id",
                      boxSet: "$imeiData.boxSet",
                      journey: {
                          _id: "$imeiData.journey._id",
                          totalDuration: "$imeiData.journey.totalDuration",
                          totalDistance: "$imeiData.journey.totalDistance",
                          endDate: "$imeiData.journey.endDate",
                          startDate: "$imeiData.journey.startDate",
                          createdBy: "$imeiData.journey.createdBy",
                          journeyName: "$imeiData.journey.journeyName"
                      }
                  }
              }
          }
      },
      {
          $project: {
              _id: 1,
              createdBy: 1,
              deviceGroupName: 1,
              imeiData: 1,
              "imeiData.journey._id": 1,
              "imeiData.journey.totalDuration": 1,
              "imeiData.journey.totalDistance": 1,
              "imeiData.journey.endDate": 1,
              "imeiData.journey.startDate": 1,
              "imeiData.journey.createdBy": 1,
              "imeiData.journey.journeyName": 1
          }
      }
      ];

      const records = await this.DeviceGroupModel.aggregate(pipeline)
        .skip(skip)
        .limit(limit)
        .exec();
      const count = await this.DeviceGroupModel.countDocuments().exec();
    return { count, records };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
