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
}
