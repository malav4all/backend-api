import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DeviceOnboardingDocument,
  DeviceOnboarding,
  DeviceOnboardingSchema,
} from './enities/device-onboarding.enities';
import {
  DeviceOnboardingFetchInput,
  DeviceOnboardingInput,
} from './dto/create-device-onboarding.input';
import { UpdateDeviceOnboardingInput } from './dto/update-device-onboarding.input';
import { DeviceOnboardingHistoryService } from '@imz/history/device-onboarding-history/device-onboarding-history.service';
import { DeviceSimHistoryService } from '@imz/history/device-sim-history/device-sim-history.service';
import { UserService } from '@imz/user/user.service';
import { DeviceOnboardingTenantSchema } from './enities/device-onboarding-tenant.enitiy';

@Injectable()
export class DeviceOnboardingService {
  constructor(
    @InjectModel(DeviceOnboarding.name)
    private DeviceOnboardingModel: Model<DeviceOnboardingDocument>,
    private DeviceOnboardingHistoryModel: DeviceOnboardingHistoryService,
    private DeviceSimHistoryModel: DeviceSimHistoryService,
    private UserModel: UserService,
    @InjectConnection() private connection: Connection
  ) {}

  async count() {
    return await this.DeviceOnboardingModel.count().exec();
  }

  async getTenantConnection(tenantId: string) {
    return this.connection.useDb(`tenant_${tenantId}`);
  }

  async findAll(input: DeviceOnboardingFetchInput, getLoggedInUserDetail: any) {
    try {
      const { roleId, _id, accountId } = getLoggedInUserDetail;
      const { page, limit } = input;
      const skip = this.calculateSkip(Number(page), Number(limit));
      const records = await this.queryDeviceRecords(
        Number(skip),
        Number(limit),
        roleId,
        _id,
        accountId
      );
      return records;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  calculateSkip(page: number, limit: number) {
    return page === -1 ? 0 : (page - 1) * limit;
  }

  async queryDeviceRecords(
    skip: number,
    limit: number,
    roleId: any,
    _id: string,
    accountId: any
  ) {
    try {
      let query = {};
      if (roleId.name === 'Master Admin') {
        query = {};
      } else if (roleId.name === 'Super Admin') {
        query = {
          deviceOnboardingUser: _id.toString(),
          deviceOnboardingAccount: accountId._id.toString(),
        };
      } else {
        query = {
          deviceOnboardingUser: _id.toString(),
          accountId: accountId._id.toString(),
        };
      }

      if (!accountId.tenantId) {
        return this.DeviceOnboardingModel.find(query)
          .populate([
            { path: 'deviceOnboardingAccount' },
            { path: 'deviceOnboardingUser' },
            { path: 'deviceOnboardingModel' },
          ])
          .skip(skip)
          .limit(limit)
          .lean()
          .exec();
      }

      const tenantConnection = await this.getTenantConnection(
        accountId.tenantId
      );
      const fetchTenatDb = await tenantConnection.model(
        DeviceOnboarding.name,
        DeviceOnboardingTenantSchema
      );

      return fetchTenatDb
        .find(query)
        .populate([
          { path: 'deviceOnboardingAccount' },
          { path: 'deviceOnboardingUser' },
        ])
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async create(payload: DeviceOnboardingInput, tenantId?: string) {
    try {
      const tenantConnection = await this.getTenantConnection(
        payload.tenantId || tenantId
      );
      const deviceOnboardingTenant = await tenantConnection.model(
        DeviceOnboarding.name,
        DeviceOnboardingTenantSchema
      );
      const record = await this.createDeviceRecord(payload);
      await deviceOnboardingTenant.create({
        assetsType: record.assetsType,
        deviceOnboardingIMEINumber: record.deviceOnboardingIMEINumber,
        deviceOnboardingAccount: record.deviceOnboardingAccount,
        deviceOnboardingUser: record.deviceOnboardingUser,
        tenantId: record.tenantId,
      });
      await this.createDeviceHistoryRecord(payload);
      await this.createDeviceSimHistoryRecord(payload);
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createDeviceRecord(payload: DeviceOnboardingInput) {
    return this.DeviceOnboardingModel.create(payload);
  }

  async createDeviceHistoryRecord(payload: DeviceOnboardingInput) {
    try {
      const deviceHistoryPayload: any = {
        deviceOnboardingAccount: payload.deviceOnboardingAccount,
        deviceOnboardingSimNo: payload.deviceOnboardingSimNo,
        deviceOnboardingIMEINumber:
          payload.deviceOnboardingIMEINumber.toString(),
        deviceOnboardingDate: new Date(),
        createdBy: payload.createdBy,
      };
      return this.DeviceOnboardingHistoryModel.create(deviceHistoryPayload);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createDeviceSimHistoryRecord(payload: DeviceOnboardingInput) {
    try {
      const deviceSimHistoryPayload: any = {
        deviceOnboardingSimNo: payload.deviceOnboardingSimNo,
        deviceOnboardingIMEINumber: payload.deviceOnboardingIMEINumber,
        createdBy: payload.createdBy,
        fromDate: new Date(),
      };

      return this.DeviceSimHistoryModel.create(deviceSimHistoryPayload);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(payload: UpdateDeviceOnboardingInput) {
    try {
      const existingRecord = await this.findDeviceById(payload._id);
      const updatePayload = { ...payload };
      const record = await this.updateDeviceRecord(payload._id, updatePayload);
      const deviceHistoryPayload = this.createDeviceHistoryPayload(
        record,
        existingRecord
      );

      await this.DeviceOnboardingHistoryModel.create(deviceHistoryPayload);
      if (
        this.hasSimNoChanged(
          existingRecord.deviceOnboardingSimNo,
          payload.deviceOnboardingSimNo
        )
      ) {
        const deviceSimHistoryPayload = this.createDeviceSimHistoryPayload(
          record,
          existingRecord
        );
        await this.DeviceSimHistoryModel.create(deviceSimHistoryPayload);
      }

      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findDeviceById(deviceId: string) {
    try {
      const existingRecord = await this.DeviceOnboardingModel.findById(
        deviceId
      ).exec();

      if (!existingRecord) {
        throw new Error('Record not found');
      }

      return existingRecord;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateDeviceRecord(deviceId: string, updatePayload: any) {
    try {
      return this.DeviceOnboardingModel.findByIdAndUpdate(
        deviceId,
        updatePayload,
        { new: true }
      ).exec();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  hasSimNoChanged(existingSimNo: any, newSimNo: any) {
    return JSON.stringify(existingSimNo) !== JSON.stringify(newSimNo);
  }

  createDeviceHistoryPayload(record: any, existingRecord: any) {
    try {
      return {
        deviceOnboardingAccount: record.deviceOnboardingAccount,
        deviceOnboardingSimNo: record.deviceOnboardingSimNo,
        deviceOnboardingIMEINumber: record.deviceOnboardingIMEINumber,
        deviceDeboardingDate: new Date(),
        createdBy: record.createdBy,
        deviceOnboardingDate: existingRecord.createdAt,
        updatedBy: record.updatedBy,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  createDeviceSimHistoryPayload(record: any, existingRecord: any) {
    try {
      return {
        deviceOnboardingIMEINumber: record.deviceOnboardingIMEINumber,
        deviceOnboardingSimNo: record.deviceOnboardingSimNo,
        createdBy: record.createdBy,
        fromDate: existingRecord.createdAt,
        toDate: new Date(),
        updatedBy: record.updatedBy,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async filterRecord(accountId: string) {
    try {
      const res = await this.UserModel.filterByAccountId(accountId);
      return res;
    } catch (error: any) {
      throw Error(error.message);
    }
  }
}
