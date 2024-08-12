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
import { UserService } from '@imz/user/user.service';

export class DeviceGroupService {
  constructor(
    @InjectConnection()
    private connection: Connection,
    private userService: UserService
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

  async findAll(input: DeviceGroupInput, loggedInUser: any) {
    try {
      // Fetch the logged-in user object
      const getUser = await this.userService.fetchUserByUserId(
        loggedInUser?.userId?.toString()
      );

      // Check the admin flags
      const isAccountAdmin = getUser[0]?.isAccountAdmin || false;
      const isSuperAdmin = getUser[0]?.isSuperAdmin || false;

      let filter = {};

      // Only apply the filter if the user is not an account admin or super admin
      if (!isAccountAdmin && !isSuperAdmin) {
        // Extract device group IDs from the logged-in user's object
        const deviceGroupIds = getUser[0]?.deviceGroup?.map((group: any) =>
          group._id.toString()
        );

        if (!deviceGroupIds || deviceGroupIds.length === 0) {
          return { records: [], count: 0 };
        }

        filter = { _id: { $in: deviceGroupIds } };
      }

      // Get the tenant model
      const deviceGroupModel = await this.getTenantModel<DeviceGroup>(
        input.accountId,
        DeviceGroup.name,
        DeviceGroupSchema
      );

      if (!deviceGroupModel) {
        return { records: [], count: 0 };
      }

      // Pagination settings
      const page = Number(input.page) || 1;
      const limit = Number(input.limit) || 10;
      const skip = page === -1 ? 0 : (page - 1) * limit;

      // Query the database with or without the filter
      const records = await deviceGroupModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      // Count the total number of records with or without the filter
      const count = await deviceGroupModel.countDocuments(filter);

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
