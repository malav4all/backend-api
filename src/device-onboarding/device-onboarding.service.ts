import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';
import {
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
import { DeviceOnboardingCopyDocument } from './enities/device-onboarding.copy.entity';

@Injectable()
export class DeviceOnboardingService {
  constructor(
    private DeviceOnboardingHistoryModel: DeviceOnboardingHistoryService,
    private DeviceSimHistoryModel: DeviceSimHistoryService,
    private UserModel: UserService,
    @InjectConnection() private connection: Connection,
    @InjectModel(DeviceOnboarding.name)
    private DeviceOnboardingCopyModel: Model<DeviceOnboardingCopyDocument>
  ) {}

  async getTenantModel<T>(
    tenantId: string,
    modelName: string,
    schema: any
  ): Promise<Model<T>> {
    const tenantConnection = await this.connection.useDb(`tenant_${tenantId}`);
    return tenantConnection.model(modelName, schema);
  }

  async findAll(input: DeviceOnboardingFetchInput) {
    try {
      let deviceOnboardingModel;

      if (input.accountId) {
        deviceOnboardingModel = await this.getTenantModel<DeviceOnboarding>(
          input.accountId,
          DeviceOnboarding.name,
          DeviceOnboardingSchema
        );
      } else {
        deviceOnboardingModel = this.DeviceOnboardingCopyModel;
      }

      const { page, limit } = input;
      const skip = this.calculateSkip(Number(page), Number(limit));

      const records = await deviceOnboardingModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .exec();

      const count = await deviceOnboardingModel.countDocuments().exec();
      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(
        `FindAll operation failed: ${error.message}`
      );
    }
  }

  calculateSkip(page: number, limit: number) {
    return page === -1 ? 0 : (page - 1) * limit;
  }

  async create(payload: DeviceOnboardingInput) {
    try {
      const deviceOnboardingModel = await this.getTenantModel<DeviceOnboarding>(
        payload.accountId,
        DeviceOnboarding.name,
        DeviceOnboardingSchema
      );
      await this.DeviceOnboardingCopyModel.create(payload);
      const record = await deviceOnboardingModel.create(payload);
      await this.createDeviceHistoryRecord(payload);
      await this.createDeviceSimHistoryRecord(payload);
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createDeviceHistoryRecord(payload: DeviceOnboardingInput) {
    try {
      const deviceHistoryPayload: any = {
        deviceOnboardingAccount: payload.accountId,
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
    // try {
    //   const deviceOnboardingModel = await this.getTenantModel<DeviceOnboarding>(
    //     payload.accountId,
    //     DeviceOnboarding.name,
    //     DeviceOnboardingSchema
    //   );
    //   const existingRecord = await deviceOnboardingModel.findByIdAndUpdate(
    //     payload._id
    //   );
    //   const updatePayload = { ...payload };
    //   const record = await deviceOnboardingModel
    //     .findByIdAndUpdate(deviceId, updatePayload, { new: true })
    //     .exec();
    //   const deviceHistoryPayload = this.createDeviceHistoryPayload(
    //     record,
    //     existingRecord
    //   );
    //   await this.DeviceOnboardingHistoryModel.create(deviceHistoryPayload);
    //   if (
    //     this.hasSimNoChanged(
    //       existingRecord.deviceOnboardingSimNo,
    //       payload.deviceOnboardingSimNo
    //     )
    //   ) {
    //     const deviceSimHistoryPayload = this.createDeviceSimHistoryPayload(
    //       record,
    //       existingRecord
    //     );
    //     await this.DeviceSimHistoryModel.create(deviceSimHistoryPayload);
    //   }
    //   return record;
    // } catch (error) {
    //   throw new InternalServerErrorException(error.message);
    // }
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

  async bulkDeviceAssignment(payload: DeviceOnboardingInput[]) {
    const payloadLength = payload.length;
    const defaultBatchSize = 1000;
    const maxBatchSize = 10000;

    // Calculate batch size dynamically
    const batchSize =
      Math.min(Math.ceil(payloadLength / 10), maxBatchSize) || defaultBatchSize;
    const results = [];

    const deviceOnboardingModel = await this.getTenantModel<DeviceOnboarding>(
      payload[0].accountId,
      DeviceOnboarding.name,
      DeviceOnboardingSchema
    );

    try {
      for (let i = 0; i < payloadLength; i += batchSize) {
        const batch = payload.slice(i, i + batchSize);
        const record = await deviceOnboardingModel.insertMany(batch);
        await this.DeviceOnboardingCopyModel.insertMany(batch);
        results.push(...record);
      }
      return results;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
