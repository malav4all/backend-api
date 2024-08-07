import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  DeviceOnboarding,
  DeviceOnboardingSchema,
} from './enities/device-onboarding.enities';
import {
  BulkDeviceOnboardingInput,
  DeviceOnboardingAccountIdInput,
  DeviceOnboardingFetchInput,
  DeviceOnboardingInput,
  DeviceTransferInput,
} from './dto/create-device-onboarding.input';
import { UpdateDeviceOnboardingInput } from './dto/update-device-onboarding.input';
import { DeviceOnboardingHistoryService } from '@imz/history/device-onboarding-history/device-onboarding-history.service';
import { DeviceSimHistoryService } from '@imz/history/device-sim-history/device-sim-history.service';
import { UserService } from '@imz/user/user.service';
import { DeviceOnboardingCopyDocument } from './enities/device-onboarding.copy.entity';
import { RedisService } from '@imz/redis/redis.service';
import { InfluxdbService } from '@imz/influx-db/influx-db-.service';
import * as async from 'async';
import { DeviceLineGraphData } from './dto/response';
import { convertUTCToIST } from '@imz/helper/generateotp';

@Injectable()
export class DeviceOnboardingService {
  constructor(
    private DeviceOnboardingHistoryModel: DeviceOnboardingHistoryService,
    private DeviceSimHistoryModel: DeviceSimHistoryService,
    private UserModel: UserService,
    @InjectConnection() private connection: Connection,
    @InjectModel(DeviceOnboarding.name)
    private DeviceOnboardingCopyModel: Model<DeviceOnboardingCopyDocument>,
    private readonly redisService: RedisService,
    private influxDbService: InfluxdbService
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

      const redisClient = this.redisService.getClient();

      // Set data in Redis
      const value = JSON.stringify({
        accountId: payload.accountId,
        imei: payload.deviceOnboardingIMEINumber,
      });
      await redisClient.set(payload.deviceOnboardingIMEINumber, value);
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

  async getOfflineGraphData(
    input: DeviceOnboardingAccountIdInput
  ): Promise<any> {
    try {
      const deviceOnboardingModel = await this.getTenantModel<DeviceOnboarding>(
        input.accountId,
        DeviceOnboarding.name,
        DeviceOnboardingSchema
      );
      const devices = await deviceOnboardingModel.find().lean().exec();

      const now = new Date();
      const oneHourAgo = convertUTCToIST(
        new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString()
      );
      const twoHoursAgo = convertUTCToIST(
        new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
      );
      const threeHoursAgo = convertUTCToIST(
        new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString()
      );

      let oneHourOfflineCount: any = 0;
      let twoHoursOfflineCount: any = 0;
      let threeHoursOfflineCount: any = 0;
      let disconnectedCount: any = 0;
      let neverConnectedCount: any = 0;

      // Define the batch size
      const batchSize = 1000;

      // Split devices into batches
      const batches = [];
      for (let i = 0; i < devices.length; i += batchSize) {
        batches.push(devices.slice(i, i + batchSize));
      }

      // Process batches concurrently
      await async.eachLimit(batches, 10, async (batch) => {
        await Promise.all(
          batch.map(async (device) => {
            const imei = device.deviceOnboardingIMEINumber;
            const fluxQuery = `
              from(bucket: "IMZ113343")
                |> range(start: ${threeHoursAgo}) // Checking data from the last 3 hours
                |> filter(fn: (r) => r["_measurement"] == "track")
                |> filter(fn: (r) => r["Terminal_ID"] == "${imei}")
                |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
            `;

            try {
              const queryResults = await this.influxDbService.executeQuery(
                fluxQuery
              );
              let lastReportedTime: string | null = null;

              for await (const { values } of queryResults) {
                const timestamp = values[2]; // Assuming the timestamp is the third element
                if (timestamp) {
                  lastReportedTime = convertUTCToIST(timestamp);
                  break;
                }
              }

              if (!lastReportedTime) {
                neverConnectedCount++;
              } else {
                const lastReportedDate = new Date(
                  lastReportedTime
                ).toISOString();
                if (lastReportedDate < threeHoursAgo) {
                  disconnectedCount++;
                } else if (lastReportedDate < twoHoursAgo) {
                  threeHoursOfflineCount++;
                } else if (lastReportedDate < oneHourAgo) {
                  twoHoursOfflineCount++;
                } else {
                  oneHourOfflineCount++;
                }
              }
            } catch (error) {
              console.error(
                `Error executing query for IMEI ${imei}:`,
                error.message
              );
              neverConnectedCount++;
            }
          })
        );
      });

      return {
        series: [
          oneHourOfflineCount,
          threeHoursOfflineCount + twoHoursOfflineCount,
          disconnectedCount,
          neverConnectedCount,
        ],
        labels: ['Since 1 hour', 'since 3 hour', 'Disconnected', 'Malfunction'],
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  async getOnlineGraphData(
    input: DeviceOnboardingAccountIdInput
  ): Promise<{ series: number[]; labels: string[] }> {
    try {
      const deviceOnboardingModel = await this.getTenantModel<DeviceOnboarding>(
        input.accountId,
        DeviceOnboarding.name,
        DeviceOnboardingSchema
      );
      const devices = await deviceOnboardingModel.find().lean().exec();

      const now = new Date();
      const oneHourAgo = new Date(
        now.getTime() - 1 * 60 * 60 * 1000
      ).toISOString();

      let onlineCount = 0;

      // Define the batch size
      const batchSize = 1000;

      // Split devices into batches
      const batches = [];
      for (let i = 0; i < devices.length; i += batchSize) {
        batches.push(devices.slice(i, i + batchSize));
      }

      // Process batches concurrently
      await async.eachLimit(batches, 10, async (batch) => {
        await Promise.all(
          batch.map(async (device) => {
            const imei = device.deviceOnboardingIMEINumber;
            const fluxQuery = `
              from(bucket: "IMZ113343")
                |> range(start: ${oneHourAgo}) // Checking data from the last 1 hour
                |> filter(fn: (r) => r["_measurement"] == "track")
                |> filter(fn: (r) => r["Terminal_ID"] == "${imei}")
            `;

            try {
              const queryResults = await this.influxDbService.executeQuery(
                fluxQuery
              );
              let lastReportedTime: string | null = null;

              for await (const { values } of queryResults) {
                const timestamp = values[2]; // Assuming the timestamp is the third element
                if (timestamp) {
                  lastReportedTime = convertUTCToIST(timestamp);
                  break;
                }
              }

              if (lastReportedTime) {
                const lastReportedDate = new Date(
                  lastReportedTime
                ).toISOString();
                const oneHourAgoIST = convertUTCToIST(oneHourAgo);
                if (lastReportedDate >= oneHourAgoIST) {
                  onlineCount++;
                }
              }
            } catch (error) {
              console.error(
                `Error executing query for IMEI ${imei}:`,
                error.message
              );
            }
          })
        );
      });

      return {
        series: [onlineCount],
        labels: ['Online'],
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  async getHourlyOnlineOfflineData(
    input: DeviceOnboardingAccountIdInput
  ): Promise<DeviceLineGraphData> {
    try {
      const deviceOnboardingModel = await this.getTenantModel<DeviceOnboarding>(
        input.accountId,
        DeviceOnboarding.name,
        DeviceOnboardingSchema
      );
      const devices = await deviceOnboardingModel.find().lean().exec();

      const now = new Date();
      const currentHour = now.getHours();
      const categories = Array.from({ length: currentHour + 1 }, (_, i) =>
        ((currentHour - i + 24) % 24).toString()
      );

      const onlineCounts = Array(currentHour + 1).fill(0);
      const offlineCounts = Array(currentHour + 1).fill(0);

      // Check for each hour in the last few hours
      for (let i = 0; i <= currentHour; i++) {
        const hourStartUTC = new Date(
          now.getTime() - (i + 1) * 60 * 60 * 1000
        ).toISOString();
        const hourEndUTC = new Date(
          now.getTime() - i * 60 * 60 * 1000
        ).toISOString();
        const hourStartIST = convertUTCToIST(hourStartUTC);
        const hourEndIST = convertUTCToIST(hourEndUTC);

        const fluxQuery = `
          from(bucket: "IMZ113343")
            |> range(start: ${hourStartIST}, stop: ${hourEndIST})
            |> filter(fn: (r) => r["_measurement"] == "track")
            |> keep(columns: ["_time"])
        `;

        try {
          const queryResults = await this.influxDbService.executeQuery(
            fluxQuery
          );
          let hasData = false;

          for await (const { values } of queryResults) {
            if (values) {
              hasData = true;
              break;
            }
          }

          if (hasData) {
            onlineCounts[i]++;
          } else {
            offlineCounts[i]++;
          }
        } catch (error) {
          console.error(`Error executing query for hour ${i}:`, error.message);
          offlineCounts[i]++;
        }
      }

      return {
        xaxis: { categories: categories.reverse() },
        series: [
          {
            name: 'Online',
            data: onlineCounts.reverse(),
          },
          {
            name: 'Offline',
            data: offlineCounts.reverse(),
          },
        ],
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  async filterRecordByAccountId(accountId: string) {
    try {
      const deviceOnboardingModel = await this.getTenantModel<DeviceOnboarding>(
        accountId,
        DeviceOnboarding.name,
        DeviceOnboardingSchema
      );
      const res = await deviceOnboardingModel.find({ accountId }).lean().exec();
      return res;
    } catch (error: any) {
      throw Error(error.message);
    }
  }

  async bulkDeviceAssignment(payload: DeviceOnboardingInput[]) {
    const payloadLength = payload.length;
    const defaultBatchSize = 1000;
    const maxBatchSize = 10000;
    const redisClient = this.redisService.getClient();

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
        // Set data in Redis for each device in the batch
        for (const device of batch) {
          const value = JSON.stringify({
            accountId: device.accountId,
            imei: device.deviceOnboardingIMEINumber,
          });
          await redisClient.set(device.deviceOnboardingIMEINumber, value);
        }
      }
      return results;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async transferData(payload: DeviceTransferInput) {
    const { fromAccountId, toAccountId, imei, accountTransferBy } = payload;

    // Get the tenant model for the fromAccountId
    const fromDeviceOnboardingModel =
      await this.getTenantModel<DeviceOnboarding>(
        fromAccountId,
        DeviceOnboarding.name,
        DeviceOnboardingSchema
      );

    // Get the tenant model for the toAccountId
    const toDeviceOnboardingModel = await this.getTenantModel<DeviceOnboarding>(
      toAccountId,
      DeviceOnboarding.name,
      DeviceOnboardingSchema
    );

    // Fetch the document based on the imei and fromAccountId
    const deviceOnboarding = await fromDeviceOnboardingModel.findOne({
      deviceOnboardingIMEINumber: imei,
    });

    if (!deviceOnboarding) {
      throw new Error(
        `No device found with IMEI: ${imei} for account: ${fromAccountId}`
      );
    }

    // Remove the document from the fromAccountId's deviceOnboarding collection
    const deleteResult = await fromDeviceOnboardingModel.deleteOne({
      deviceOnboardingIMEINumber: imei,
    });

    if (deleteResult.deletedCount === 0) {
      throw new Error(
        `Failed to delete device with IMEI: ${imei} from account: ${fromAccountId}`
      );
    }

    // Update the accountId to toAccountId and add accountTransferBy field
    deviceOnboarding.accountId = toAccountId;
    deviceOnboarding.accountTransferBy = accountTransferBy;

    // Remove the _id field to avoid duplicate key error
    const newDeviceOnboardingData = deviceOnboarding.toObject();
    delete newDeviceOnboardingData._id;

    try {
      // Insert the updated document into the toAccountId's deviceOnboarding collection
      await toDeviceOnboardingModel.create(newDeviceOnboardingData);
      // Insert the document into the DeviceOnboardingCopyModel for logging/auditing
      await this.DeviceOnboardingCopyModel.create(newDeviceOnboardingData);
      const redisClient = this.redisService.getClient();
      const redisValue = JSON.stringify({
        accountId: toAccountId,
        imei: imei,
      });
      await redisClient.set(imei, redisValue);
    } catch (error) {
      // If there's an error inserting the document, log the error and reinsert into the original collection
      await fromDeviceOnboardingModel.create(deviceOnboarding.toObject());
      throw new Error(
        `Failed to insert device with IMEI: ${imei} to account: ${toAccountId}. Error: ${error.message}`
      );
    }

    return { message: 'Device transferred successfully' };
  }

  async bulkTransferData(payload: BulkDeviceOnboardingInput) {
    const { fromAccountId, toAccountId, imei, accountTransferBy } = payload;
    const BATCH_SIZE = 100; // Adjust the batch size as needed

    // Get the tenant model for the fromAccountId
    const fromDeviceOnboardingModel =
      await this.getTenantModel<DeviceOnboarding>(
        fromAccountId,
        DeviceOnboarding.name,
        DeviceOnboardingSchema
      );

    // Get the tenant model for the toAccountId
    const toDeviceOnboardingModel = await this.getTenantModel<DeviceOnboarding>(
      toAccountId,
      DeviceOnboarding.name,
      DeviceOnboardingSchema
    );

    // Get the Redis client
    const redisClient = this.redisService.getClient();

    const transferredImeis = [];
    const failedImeis = [];

    // Process IMEIs in batches
    for (let i = 0; i < imei.length; i += BATCH_SIZE) {
      const batch = imei.slice(i, i + BATCH_SIZE);

      for (const imei of batch) {
        try {
          // Fetch the document based on the imei and fromAccountId
          const deviceOnboarding = await fromDeviceOnboardingModel.findOne({
            deviceOnboardingIMEINumber: imei,
          });

          if (!deviceOnboarding) {
            throw new Error(
              `No device found with IMEI: ${imei} for account: ${fromAccountId}`
            );
          }

          // Remove the document from the fromAccountId's deviceOnboarding collection
          const deleteResult = await fromDeviceOnboardingModel.deleteOne({
            deviceOnboardingIMEINumber: imei,
          });

          if (deleteResult.deletedCount === 0) {
            throw new Error(
              `Failed to delete device with IMEI: ${imei} from account: ${fromAccountId}`
            );
          }

          // Update the accountId to toAccountId and add accountTransferBy field
          deviceOnboarding.accountId = toAccountId;
          deviceOnboarding.accountTransferBy = accountTransferBy;

          // Remove the _id field to avoid duplicate key error
          const newDeviceOnboardingData = deviceOnboarding.toObject();
          delete newDeviceOnboardingData._id;

          // Insert the updated document into the toAccountId's deviceOnboarding collection
          await toDeviceOnboardingModel.create(newDeviceOnboardingData);
          // Insert the document into the DeviceOnboardingCopyModel for logging/auditing
          await this.DeviceOnboardingCopyModel.create(newDeviceOnboardingData);

          // Update data in Redis
          const redisValue = JSON.stringify({
            accountId: toAccountId,
            imei: imei,
          });
          await redisClient.set(imei, redisValue);

          transferredImeis.push(imei);
        } catch (error) {
          failedImeis.push({ imei, error: error.message });
        }
      }
    }

    return {
      message: 'Bulk transfer completed',
      transferredImeis,
      failedImeis,
    };
  }
}
