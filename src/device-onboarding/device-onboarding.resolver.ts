import { Args, Mutation, Resolver, Query, Context } from '@nestjs/graphql';
import {
  DeviceLineGraphData,
  DeviceOfflineGraphData,
  DeviceOnboardingResponse,
  DeviceOnlineOfflineCount,
  ImeiListResponse,
} from './dto/response';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@imz/user/guard';
import {
  BulkDeviceOnboardingInput,
  DeviceOnboardingAccountIdInput,
  DeviceOnboardingFetchInput,
  DeviceOnboardingInput,
  DeviceTransferInput,
  GetBatteryPercentageGraphInput,
} from './dto/create-device-onboarding.input';
import { DeviceOnboardingService } from './device-onboarding.service';
import { UpdateDeviceOnboardingInput } from './dto/update-device-onboarding.input';
import { UserResponseType } from './dto/user.response.type';

@Resolver(() => DeviceOnboardingResponse)
export class DeviceOnboardingResolver {
  constructor(
    private readonly deviceOnboardingService: DeviceOnboardingService
  ) {}

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceOnboardingResponse)
  async filterRecordAccountId(
    @Args('input') input: DeviceOnboardingAccountIdInput
  ) {
    try {
      const record = await this.deviceOnboardingService.filterRecordByAccountId(
        input.accountId
      );
      return {
        success: record ? 1 : 0,
        message: record
          ? 'Record created.'
          : 'Record not created. Please try again.',
        data: record,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceOnboardingResponse)
  async createDeviceOnboarding(@Args('input') input: DeviceOnboardingInput) {
    const record = await this.deviceOnboardingService.create(input);
    return {
      success: record ? 1 : 0,
      message: record
        ? 'Record created.'
        : 'Record not created. Please try again.',
    };
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceOnboardingResponse)
  async fetchDeviceOnboardingList(
    @Args('input') input: DeviceOnboardingFetchInput,
    @Context() context
  ) {
    try {
      const loggedInUser = {
        userId: context?.user?._id,
      };
      const { records, count } = await this.deviceOnboardingService.findAll(
        input,
        loggedInUser
      );
      return {
        paginatorInfo: {
          count: count,
        },
        success: 1,
        message: 'Device Onboarding list available.',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceOnboardingResponse)
  async updateDeviceOnboarding(
    @Args('input') input: UpdateDeviceOnboardingInput
  ) {
    try {
      const record = await this.deviceOnboardingService.update(input);
      return {
        success: record ? 1 : 0,
        message: record
          ? 'Records update successfully.'
          : 'Technical issue please try agian.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceOnboardingResponse)
  async bulkUploadDeviceAssignment(
    @Args('input', { type: () => [DeviceOnboardingInput] })
    input: DeviceOnboardingInput[]
  ) {
    try {
      const record = await this.deviceOnboardingService.bulkDeviceAssignment(
        input
      );
      return {
        success: record ? 1 : 0,
        message: record
          ? 'Record uploaded.'
          : 'Assert Record not uploaded. Please try again.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceOnboardingResponse)
  async deviceTransferOneToAnotherAccount(
    @Args('input')
    input: DeviceTransferInput
  ) {
    try {
      const { message } = await this.deviceOnboardingService.transferData(
        input
      );
      return {
        success: 0,
        message,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceOnboardingResponse)
  async bulkDeviceTransferOneToAnotherAccount(
    @Args('input')
    input: BulkDeviceOnboardingInput
  ) {
    try {
      const { message } = await this.deviceOnboardingService.bulkTransferData(
        input
      );
      return {
        success: 0,
        message,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceOfflineGraphData)
  async offlineDeviceGraph(
    @Args('input')
    input: DeviceOnboardingAccountIdInput,
    @Context() context
  ) {
    try {
      const loggedInUser = {
        userId: context?.user?._id,
      };

      const record = await this.deviceOnboardingService.getOfflineGraphData(
        input,
        loggedInUser
      );
      return {
        success: 1,
        series: record.series,
        labels: record.labels,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceOfflineGraphData)
  async onlineDeviceGraph(
    @Args('input')
    input: DeviceOnboardingAccountIdInput,
    @Context() context
  ) {
    try {
      const loggedInUser = {
        userId: context?.user?._id,
      };
      const record = await this.deviceOnboardingService.getOnlineGraphData(
        input,
        loggedInUser
      );
      return {
        success: 1,
        series: record.series,
        labels: record.labels,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceLineGraphData)
  async lineGraphDeviceData(
    @Args('input')
    input: DeviceOnboardingAccountIdInput,
    @Context() context
  ): Promise<DeviceLineGraphData> {
    try {
      const loggedInUser = {
        userId: context?.user?._id,
      };
      const record =
        await this.deviceOnboardingService.getHourlyOnlineOfflineData(
          input,
          loggedInUser
        );
      return {
        xaxis: record.xaxis,
        series: record.series,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceLineGraphData)
  async batteryGraphDataData(
    @Args('input')
    input: GetBatteryPercentageGraphInput
  ): Promise<DeviceLineGraphData> {
    try {
      const record =
        await this.deviceOnboardingService.getBatteryPercentageData(input);
      return {
        xaxis: record.xaxis,
        series: record.series,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceLineGraphData)
  async speedGraphData(
    @Args('input')
    input: GetBatteryPercentageGraphInput
  ): Promise<DeviceLineGraphData> {
    try {
      const record = await this.deviceOnboardingService.getSpeedData(input);
      return {
        xaxis: record.xaxis,
        series: record.series,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceOnlineOfflineCount)
  async getOnlineOfflineCount(
    @Args('input')
    input: DeviceOnboardingAccountIdInput,
    @Context() context
  ): Promise<DeviceOnlineOfflineCount> {
    try {
      const loggedInUser = {
        userId: context?.user?._id,
      };
      const record =
        await this.deviceOnboardingService.getDeviceOnlineOfflineCounts(
          input,
          loggedInUser
        );
      return {
        totalDeviceCount: record.totalDeviceCount,
        online: record.online,
        offline: record.offline,
        data: record.data,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => ImeiListResponse)
  async getImeiList(
    @Args('input') input: DeviceOnboardingAccountIdInput,
    @Context() context
  ): Promise<ImeiListResponse> {
    try {
      const imeiList = await this.deviceOnboardingService.getImeiList(input);
      return {
        success: 1,
        imeiList,
        message: 'IMEI list fetched successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceOnboardingResponse)
  async fetchDeviceOnboardingListWithLocation(
    @Args('input') input: DeviceOnboardingFetchInput,
    @Context() context
  ) {
    try {
      const loggedInUser = {
        userId: context?.user?._id,
      };
      const { records, count } =
        await this.deviceOnboardingService.findAllWithLocation(
          input,
          loggedInUser
        );
      return {
        paginatorInfo: {
          count: count,
        },
        success: 1,
        message: 'Device Onboarding list with location available.',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
