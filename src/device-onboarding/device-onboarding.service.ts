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
  GetBatteryPercentageGraphInput,
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

  async findAll(input: DeviceOnboardingFetchInput, loggedInUser: any) {
    try {
      // Fetch the logged-in user object
      const getUser = await this.UserModel.fetchUserByUserId(
        loggedInUser?.userId?.toString()
      );

      // Check the admin flags
      const isAccountAdmin = getUser[0]?.isAccountAdmin || false;
      const isSuperAdmin = getUser[0]?.isSuperAdmin || false;

      let deviceOnboardingModel;

      if (input.accountId) {
        deviceOnboardingModel = await this.getTenantModel<DeviceOnboarding>(
          input.accountId,
          DeviceOnboarding.name,
          DeviceOnboardingSchema
        );

        let filter = {};

        // Apply IMEI filtering only if neither flag is true
        if (!isAccountAdmin && !isSuperAdmin) {
          let imeiList = getUser[0]?.imeiList || [];

          // If imeiList is empty, extract IMEIs from the user's deviceGroup
          if (!imeiList.length && getUser[0]?.deviceGroup?.length) {
            imeiList = getUser[0].deviceGroup.reduce(
              (acc: string[], group: any) => {
                if (group.imeiData && group.imeiData.length) {
                  acc = acc.concat(group.imeiData);
                }
                return acc;
              },
              []
            );
          }

          // Apply the IMEI filter if there are IMEIs to filter by
          if (imeiList.length > 0) {
            filter = { deviceOnboardingIMEINumber: { $in: imeiList } };
          } else {
            // If there are still no IMEIs, return an empty result
            return { records: [], count: 0 };
          }
        }

        // Query the database with the filter and pagination
        const { page, limit } = input;
        const skip = this.calculateSkip(Number(page), Number(limit));

        const records = await deviceOnboardingModel
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .exec();

        // Count the total number of filtered records
        const count = await deviceOnboardingModel.countDocuments(filter).exec();

        return { records, count };
      } else {
        // If no accountId is provided, use the default model without the filter
        deviceOnboardingModel = this.DeviceOnboardingCopyModel;

        const { page, limit } = input;
        const skip = this.calculateSkip(Number(page), Number(limit));

        const records = await deviceOnboardingModel
          .find({})
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .exec();

        const count = await deviceOnboardingModel.countDocuments().exec();

        return { records, count };
      }
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

      const redisClient = this.redisService.getClient('default-0');

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
    try {
      const deviceOnboardingModel = await this.getTenantModel<DeviceOnboarding>(
        payload.accountId,
        DeviceOnboarding.name,
        DeviceOnboardingSchema
      );
      const updatePayload = {
        ...payload,
        lastUpdated: new Date(),
      };
      const record = await deviceOnboardingModel
        .findByIdAndUpdate(payload._id, updatePayload, {
          new: true,
        })
        .exec();

      const redisClient = this.redisService.getClient('default-${0}');

      // Set data in Redis
      const value = JSON.stringify({
        accountId: payload.accountId,
        imei: payload.deviceOnboardingIMEINumber,
        label: payload.deviceName,
      });
      await redisClient.set(payload.deviceOnboardingIMEINumber, value);
      return record;
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

  async getOfflineGraphData(
    input: DeviceOnboardingAccountIdInput,
    loggedInUser: any
  ): Promise<any> {
    try {
      // Fetch the logged-in user object
      const getUser = await this.UserModel.fetchUserByUserId(
        loggedInUser?.userId?.toString()
      );

      // Check the admin flags
      const isAccountAdmin = getUser[0]?.isAccountAdmin || false;
      const isSuperAdmin = getUser[0]?.isSuperAdmin || false;

      let filter = {};

      // Apply IMEI filtering only if neither flag is true
      if (!isAccountAdmin && !isSuperAdmin) {
        let imeiList = getUser[0]?.imeiList || [];

        // If imeiList is empty, extract IMEIs from the user's deviceGroup
        if (!imeiList.length && getUser[0]?.deviceGroup?.length) {
          imeiList = getUser[0].deviceGroup.reduce(
            (acc: string[], group: any) => {
              if (group.imeiData && group.imeiData.length) {
                acc = acc.concat(group.imeiData);
              }
              return acc;
            },
            []
          );
        }

        // Apply the filter if there are IMEIs to filter by
        if (imeiList.length > 0) {
          filter = { deviceOnboardingIMEINumber: { $in: imeiList } };
        } else {
          // If there are still no IMEIs, return an empty result
          return {
            series: [0, 0, 0, 0],
            labels: [
              'Since 1 hour',
              'since 3 hour',
              'Disconnected',
              'Never Connected',
            ],
          };
        }
      }

      const deviceOnboardingModel = await this.getTenantModel<DeviceOnboarding>(
        input.accountId,
        DeviceOnboarding.name,
        DeviceOnboardingSchema
      );
      const devices = await deviceOnboardingModel.find(filter).lean().exec();

      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

      const nowIST = new Date(convertUTCToIST(now));
      const oneHourAgoIST = new Date(convertUTCToIST(oneHourAgo));
      const twoHoursAgoIST = new Date(convertUTCToIST(twoHoursAgo));
      const threeHoursAgoIST = new Date(convertUTCToIST(threeHoursAgo));

      let oneHourOfflineCount = 0;
      let twoHoursOfflineCount = 0;
      let threeHoursOfflineCount = 0;
      let disconnectedCount = 0;
      let neverConnectedCount = 0;

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
              from(bucket: "${input.accountId}")
                |> range(start: 0, stop: now()) // Check data for the last 30 days to ensure we get the last reported time
                |> filter(fn: (r) => r["_measurement"] == "track")
                |> filter(fn: (r) => r["imei"] == "${imei}")
                |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
                |> sort(columns: ["_time"], desc: true)
                |> limit(n: 1)
            `;

            try {
              const queryResults = await this.influxDbService.executeQuery(
                fluxQuery
              );
              let lastReportedTime: string | null = null;

              for await (const { values } of queryResults) {
                const timestamp = values[4]; // Assuming the timestamp is the third element
                if (timestamp) {
                  lastReportedTime = convertUTCToIST(timestamp);
                  break;
                }
              }

              if (!lastReportedTime) {
                // No data has ever been reported for this device
                neverConnectedCount++;
              } else {
                const lastReportedDate = new Date(lastReportedTime);

                // Compare the last reported time with the current time ranges
                if (lastReportedDate < threeHoursAgoIST) {
                  disconnectedCount++;
                } else if (lastReportedDate < twoHoursAgoIST) {
                  threeHoursOfflineCount++;
                } else if (lastReportedDate < oneHourAgoIST) {
                  twoHoursOfflineCount++;
                } else {
                  oneHourOfflineCount++;
                }
              }
            } catch (error) {
              neverConnectedCount++;
            }
          })
        );
      });

      return {
        series: [
          oneHourOfflineCount,
          threeHoursOfflineCount,
          disconnectedCount,
          neverConnectedCount,
        ],
        labels: [
          'Since 1 hour',
          'since 3 hour',
          'Disconnected',
          'Never Connected',
        ],
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  async getOnlineGraphData(
    input: DeviceOnboardingAccountIdInput,
    loggedInUser: any
  ): Promise<{ series: number[]; labels: string[] }> {
    try {
      const getUser = await this.UserModel.fetchUserByUserId(
        loggedInUser?.userId?.toString()
      );

      // Check the admin flags
      const isAccountAdmin = getUser[0]?.isAccountAdmin || false;
      const isSuperAdmin = getUser[0]?.isSuperAdmin || false;

      let filter = {};

      // Apply IMEI filtering only if neither flag is true
      if (!isAccountAdmin && !isSuperAdmin) {
        let imeiList = getUser[0]?.imeiList || [];

        // If imeiList is empty, extract IMEIs from the user's deviceGroup
        if (!imeiList.length && getUser[0]?.deviceGroup?.length) {
          imeiList = getUser[0].deviceGroup.reduce(
            (acc: string[], group: any) => {
              if (group.imeiData && group.imeiData.length) {
                acc = acc.concat(group.imeiData);
              }
              return acc;
            },
            []
          );
        }

        // Apply the filter if there are IMEIs to filter by
        if (imeiList.length > 0) {
          filter = { deviceOnboardingIMEINumber: { $in: imeiList } };
        } else {
          // If there are still no IMEIs, return an empty result
          return {
            series: [0],
            labels: ['Online'],
          };
        }
      }

      const deviceOnboardingModel = await this.getTenantModel<DeviceOnboarding>(
        input.accountId,
        DeviceOnboarding.name,
        DeviceOnboardingSchema
      );
      const devices = await deviceOnboardingModel.find(filter).lean().exec();

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
             from(bucket: "${input.accountId}")
                |> range(start: ${oneHourAgo}) // Checking data from the last 1 hour
                |> filter(fn: (r) => r["_measurement"] == "track")
                |> filter(fn: (r) => r["imei"] == "${imei}")
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
    input: DeviceOnboardingAccountIdInput,
    loggedInUser: any
  ): Promise<DeviceLineGraphData> {
    try {
      // Fetch the logged-in user object
      const getUser = await this.UserModel.fetchUserByUserId(
        loggedInUser?.userId?.toString()
      );

      // Check the admin flags
      const isAccountAdmin = getUser[0]?.isAccountAdmin || false;
      const isSuperAdmin = getUser[0]?.isSuperAdmin || false;

      let filter = {};

      // Apply IMEI filtering only if neither flag is true
      if (!isAccountAdmin && !isSuperAdmin) {
        let imeiList = getUser[0]?.imeiList || [];

        // If imeiList is empty, extract IMEIs from the user's deviceGroup
        if (!imeiList.length && getUser[0]?.deviceGroup?.length) {
          imeiList = getUser[0].deviceGroup.reduce(
            (acc: string[], group: any) => {
              if (group.imeiData && group.imeiData.length) {
                acc = acc.concat(group.imeiData);
              }
              return acc;
            },
            []
          );
        }

        // Apply the filter if there are IMEIs to filter by
        if (imeiList.length > 0) {
          filter = { deviceOnboardingIMEINumber: { $in: imeiList } };
        } else {
          // If there are still no IMEIs, return an empty result
          return {
            xaxis: { categories: [] },
            series: [
              { name: 'Online', data: [] },
              { name: 'Offline', data: [] },
            ],
          };
        }
      }

      // Fetch devices from the device onboarding model
      const deviceOnboardingModel = await this.getTenantModel<DeviceOnboarding>(
        input.accountId,
        DeviceOnboarding.name,
        DeviceOnboardingSchema
      );
      const devices = await deviceOnboardingModel.find(filter).lean().exec();

      // Extract the IMEI numbers from the devices
      const deviceImeiList = devices.map(
        (device) => device.deviceOnboardingIMEINumber
      );

      // Set up date and hour information
      const now = new Date();
      const currentHour = now.getHours();
      const categories = Array.from({ length: currentHour + 1 }, (_, i) =>
        ((currentHour - i + 24) % 24).toString()
      );

      const onlineCounts = Array(currentHour + 1).fill(0);
      const offlineCounts = Array(currentHour + 1).fill(0);

      // Iterate over each hour to check device status
      for (let i = 0; i <= currentHour; i++) {
        const hourStartUTC = new Date(
          now.getTime() - (i + 1) * 60 * 60 * 1000
        ).toISOString();
        const hourEndUTC = new Date(
          now.getTime() - i * 60 * 60 * 1000
        ).toISOString();
        const hourStartIST = convertUTCToIST(hourStartUTC);
        const hourEndIST = convertUTCToIST(hourEndUTC);

        // Build the InfluxDB query
        const fluxQuery = `
          from(bucket: "${input.accountId}")
            |> range(start: ${hourStartIST}, stop: ${hourEndIST})
            |> filter(fn: (r) => r["_measurement"] == "track")
            |> filter(fn: (r) => r["imei"] == "${deviceImeiList.join(
              '" or r["imei"] == "'
            )}")
            |> keep(columns: ["_time"])
        `;

        try {
          const queryResults = await this.influxDbService.executeQuery(
            fluxQuery
          );
          let hasData = false;

          // Check if any data is returned
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

      // Prepare the result
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

  async getDeviceOnlineOfflineCounts(
    input: DeviceOnboardingAccountIdInput,
    loggedInUser: any
  ) {
    try {
      const getUser = await this.UserModel.fetchUserByUserId(
        loggedInUser?.userId?.toString()
      );

      // Check the admin flags
      const isAccountAdmin = getUser[0]?.isAccountAdmin || false;
      const isSuperAdmin = getUser[0]?.isSuperAdmin || false;

      let filter = {};

      // Apply IMEI filtering only if neither flag is true
      if (!isAccountAdmin && !isSuperAdmin) {
        let imeiList = getUser[0]?.imeiList || [];

        // If imeiList is empty, extract IMEIs from the user's deviceGroup
        if (!imeiList.length && getUser[0]?.deviceGroup?.length) {
          imeiList = getUser[0].deviceGroup.reduce(
            (acc: string[], group: any) => {
              if (group.imeiData && group.imeiData.length) {
                acc = acc.concat(group.imeiData);
              }
              return acc;
            },
            []
          );
        }

        // Apply the filter if there are IMEIs to filter by
        if (imeiList.length > 0) {
          filter = { deviceOnboardingIMEINumber: { $in: imeiList } };
        } else {
          // If there are still no IMEIs, return an empty result
          return {
            totalDeviceCount: 0,
            online: 0,
            offline: 0,
            data: [],
          };
        }
      }

      const deviceOnboardingModel = await this.getTenantModel<DeviceOnboarding>(
        input.accountId,
        DeviceOnboarding.name,
        DeviceOnboardingSchema
      );
      const devices = await deviceOnboardingModel.find(filter).lean().exec();
      const totalDeviceCount = devices.length;

      const now = new Date();
      const oneHourAgo = new Date(
        now.getTime() - 1 * 60 * 60 * 1000
      ).toISOString();

      let onlineCount = 0;
      let offlineCount = 0;
      const deviceStatuses: any = [];

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
              from(bucket: "${input.accountId}")
                |> range(start: ${oneHourAgo}, stop: now())
                |> filter(fn: (r) => r["_measurement"] == "track")
                |> filter(fn: (r) => r["imei"] == "${imei}")
                |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
                |> keep(columns: ["_time", "name", "latitude", "longitude", "accountId", "imei"])
                |> sort(columns: ["_time"], desc: true)
                |> limit(n: 1)
            `;

            try {
              const queryResults = await this.influxDbService.executeQuery(
                fluxQuery
              );
              let lastReportedTime: string | null = null;
              let latitude: number | null = null;
              let longitude: number | null = null;
              let name: string | '';

              for await (const { values } of queryResults) {
                lastReportedTime = convertUTCToIST(values[2]); // Adjust this index if necessary
                latitude = Number(values[5]); // Adjust these indices if necessary
                longitude = Number(values[6]);
                name = values[7]; // Adjust these indices if necessary
                break;
              }

              if (
                lastReportedTime &&
                new Date(lastReportedTime).toISOString() >= oneHourAgo
              ) {
                onlineCount++;
                deviceStatuses.push({
                  accountId: input.accountId,
                  name,
                  imei,
                  status: 'online',
                  lastPing: lastReportedTime || 'N/A',
                  latitude: latitude || 0,
                  longitude: longitude || 0,
                });
              } else {
                // Additional query to get the last available data packet if no data is found in the last one hour
                const lastPacketQuery = `
                from(bucket: "${input.accountId}")
                  |> range(start: -7d, stop: now())
                  |> filter(fn: (r) => r["_measurement"] == "track")
                  |> filter(fn: (r) => r["imei"] == "${imei}")
                  |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
                  |> keep(columns: ["_time", "name", "latitude", "longitude", "accountId", "imei"])
                  |> sort(columns: ["_time"], desc: true)
                  |> limit(n: 1)
              `;

                const lastPacketResults =
                  await this.influxDbService.executeQuery(lastPacketQuery);
                let lastPacketReportedTime: string | null = null;
                let lastPacketLatitude: number | null = null;
                let lastPacketLongitude: number | null = null;

                for await (const { values } of lastPacketResults) {
                  lastPacketReportedTime = convertUTCToIST(values[2]); // Adjust this index if necessary
                  lastPacketLatitude = Number(values[5]); // Adjust these indices if necessary
                  lastPacketLongitude = Number(values[6]); // Adjust these indices if necessary
                  break;
                }

                offlineCount++;
                deviceStatuses.push({
                  accountId: input.accountId,
                  name,
                  imei,
                  status: 'offline',
                  lastPing: lastPacketReportedTime,
                  latitude: lastPacketLatitude || 0,
                  longitude: lastPacketLongitude || 0,
                });
              }
            } catch (error) {
              offlineCount++;
              deviceStatuses.push({
                name: '',
                account: input.accountId,
                imei,
                status: 'Never Connected',
                lastPing: '',
                latitude: 0,
                longitude: 0,
              });
            }
          })
        );
      });

      return {
        totalDeviceCount,
        online: onlineCount,
        offline: offlineCount,
        data: deviceStatuses,
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
    const redisClient = this.redisService.getClient('default-0');

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
      const redisClient = this.redisService.getClient('default-0');
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
    const redisClient = this.redisService.getClient('default-0');

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

  async getImeiList(input: DeviceOnboardingAccountIdInput): Promise<string[]> {
    const deviceOnboardingModel = await this.getTenantModel<DeviceOnboarding>(
      input.accountId,
      DeviceOnboarding.name,
      DeviceOnboardingSchema
    );

    // First, fetch the list of devices from DeviceOnboarding
    const devices = await deviceOnboardingModel.find().lean().exec();
    const imeis = devices.map((device) => device.deviceOnboardingIMEINumber);

    // Perform the aggregation to find IMEIs that are NOT in any device groups
    const records = await deviceOnboardingModel
      .aggregate([
        {
          $lookup: {
            from: 'devicegroups',
            let: { imei: '$deviceOnboardingIMEINumber' },
            pipeline: [
              { $match: { $expr: { $in: ['$$imei', '$imeiData'] } } },
              { $project: { _id: 1 } },
            ],
            as: 'matchedGroups',
          },
        },
        {
          $match: {
            'matchedGroups.0': { $exists: false }, // Match documents where matchedGroups array is empty
          },
        },
        {
          $project: {
            deviceOnboardingIMEINumber: 1,
          },
        },
      ])
      .exec();

    // Extract unique IMEIs from the matched records
    const uniqueImeis = new Set(
      records.map((item) => item.deviceOnboardingIMEINumber)
    );

    // Return the filtered IMEI list
    return Array.from(uniqueImeis);
  }

  async findAllWithLocation(
    input: DeviceOnboardingFetchInput,
    loggedInUser: any
  ) {
    try {
      // Fetch the logged-in user object
      const getUser = await this.UserModel.fetchUserByUserId(
        loggedInUser?.userId?.toString()
      );

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
      const imeiList = getUser[0].imeiList;
      const { page, limit, location } = input;
      const skip = this.calculateSkip(Number(page), Number(limit));

      // Create the query object
      const query: any = {};

      if (location) {
        query.location = location;
      }

      if (imeiList && imeiList.length > 0) {
        query.deviceOnboardingIMEINumber = { $in: imeiList };
      }

      const records = await deviceOnboardingModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .exec();

      const count = await deviceOnboardingModel.countDocuments(query).exec();
      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(
        `FindAll operation failed: ${error.message}`
      );
    }
  }

  async getBatteryPercentageData(
    input: GetBatteryPercentageGraphInput
  ): Promise<DeviceLineGraphData> {
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
      const categories = Array.from({ length: 24 }, (_, i) => i.toString());

      const batteryPercentages = Array(24).fill(0);

      // Check for each hour in the last 24 hours
      for (let i = 0; i <= 24; i++) {
        const hourStartUTC = new Date(
          startTime.getTime() + i * 60 * 60 * 1000
        ).toISOString();
        const hourEndUTC = new Date(
          startTime.getTime() + (i + 1) * 60 * 60 * 1000
        ).toISOString();
        const hourStartIST = convertUTCToIST(hourStartUTC);
        const hourEndIST = convertUTCToIST(hourEndUTC);

        const fluxQuery = `
          from(bucket: "${input.accountId}")
            |> range(start: ${hourStartIST}, stop: ${hourEndIST})
            |> filter(fn: (r) => r["_measurement"] == "track")
            |> filter(fn: (r) => r["imei"] == "${input.imei}")
            |> filter(fn: (r) => r["_field"] == "batteryPercentage")
        `;

        try {
          const queryResults = await this.influxDbService.executeQuery(
            fluxQuery
          );

          let sum = 0;
          let count = 0;

          for await (const { values } of queryResults) {
            if (values && values[6]) {
              const batteryPercentage = parseFloat(values[5]);
              sum += batteryPercentage;
              count++;
            }
          }
          const dataValue = sum / count;
          batteryPercentages[i] = count > 0 ? dataValue.toFixed(0) : 0;
        } catch (error) {
          console.error(`Error executing query for hour ${i}:`, error.message);
          batteryPercentages[i] = 0;
        }
      }

      return {
        xaxis: { categories: categories },
        series: [
          {
            name: 'Battery Percentage',
            data: batteryPercentages,
          },
        ],
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  async getSpeedData(
    input: GetBatteryPercentageGraphInput
  ): Promise<DeviceLineGraphData> {
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
      const categories = Array.from({ length: 24 }, (_, i) => i.toString());

      const speed = Array(24).fill(0);

      // Check for each hour in the last 24 hours
      for (let i = 0; i <= 24; i++) {
        const hourStartUTC = new Date(
          startTime.getTime() + i * 60 * 60 * 1000
        ).toISOString();
        const hourEndUTC = new Date(
          startTime.getTime() + (i + 1) * 60 * 60 * 1000
        ).toISOString();
        const hourStartIST = convertUTCToIST(hourStartUTC);
        const hourEndIST = convertUTCToIST(hourEndUTC);

        const fluxQuery = `
          from(bucket: "${input.accountId}")
            |> range(start: ${hourStartIST}, stop: ${hourEndIST})
            |> filter(fn: (r) => r["_measurement"] == "track")
            |> filter(fn: (r) => r["imei"] == "${input.imei}")
            |> filter(fn: (r) => r["_field"] == "speed")
        `;

        try {
          const queryResults = await this.influxDbService.executeQuery(
            fluxQuery
          );

          let sum = 0;
          let count = 0;

          for await (const { values } of queryResults) {
            if (values && values[5]) {
              const speedValue = parseFloat(values[5]);
              sum += speedValue;
              count++;
            }
          }
          const speedCount = sum / count;
          speed[i] = count > 0 ? speedCount.toFixed(0) : 0;
        } catch (error) {
          console.error(`Error executing query for hour ${i}:`, error.message);
          speed[i] = 0;
        }
      }

      return {
        xaxis: { categories: categories },
        series: [
          {
            name: 'Speed',
            data: speed,
          },
        ],
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }
}
