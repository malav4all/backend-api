import { InjectConnection } from '@nestjs/mongoose';
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
} from './dto/create-device-group.input';
import { UpdateDeviceGroupInput } from './dto/update-device-group.input';

export class DeviceGroupService {
  constructor(
    @InjectConnection()
    private connection: Connection
  ) {}

  async getTenantModel<T>(
    tenantId: string | undefined,
    modelName: string,
    schema: any
  ): Promise<Model<T> | null> {
    if (!tenantId || !tenantId.trim()) {
      console.warn(
        'Tenant ID is undefined or empty, skipping tenant-specific model creation'
      );
      return null;
    }
    const tenantConnection = this.connection.useDb(
      `tenant_${tenantId.trim()}`,
      { useCache: true }
    );
    return tenantConnection.model(modelName, schema);
  }

  async create(payload: CreateDeviceGroupInput) {
    try {
      const deviceGroupModel = await this.getTenantModel<DeviceGroup>(
        payload.accountId,
        DeviceGroup.name,
        DeviceGroupSchema
      );

      if (!deviceGroupModel) {
        console.warn('Skipping create operation as tenantModel is null');
        return null; // or handle the case as needed
      }

      const existingRecord = await deviceGroupModel.findOne({
        deviceGroupName: payload.deviceGroupName,
      });
      if (existingRecord) {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }
      const record = await deviceGroupModel.create({ ...payload });
      return record;
    } catch (error) {
      throw new Error(`Failed to create: ${error.message}`);
    }
  }

  async findAll(input: DeviceGroupInput) {
    try {
      const deviceGroupModel = await this.getTenantModel<DeviceGroup>(
        input.accountId,
        DeviceGroup.name,
        DeviceGroupSchema
      );

      if (!deviceGroupModel) {
        console.warn('Skipping search operation as tenantModel is null');
        return { records: [], count: 0 }; // return empty results or handle as needed
      }

      const page = Number(input.page) || 1;
      const limit = Number(input.limit) || 10;
      const skip = page === -1 ? 0 : (page - 1) * limit;
      const records = await deviceGroupModel
        .find({})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
      const count = await deviceGroupModel.countDocuments({});

      return { records, count };
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

      if (!deviceGroupModel) {
        console.warn('Skipping search operation as tenantModel is null');
        return { records: [], count: 0 }; // return empty results or handle as needed
      }

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

      if (!deviceGroupModel) {
        console.warn('Skipping update operation as tenantModel is null');
        return null; // or handle the case as needed
      }

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
}
