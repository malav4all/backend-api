import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { DeviceOnboardingHistoryResponse } from './dto/response';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@imz/user/guard';
import {
  DeviceOnboardingHistoryFetchInput,
  DeviceOnboardingHistoryInput,
} from './dto/create-device-oonboarding-history.input';
import { DeviceOnboardingHistoryService } from './device-onboarding-history.service';

@Resolver(() => DeviceOnboardingHistoryResponse)
export class DeviceOnboardingHistoryResolver {
  constructor(
    private readonly deviceOnboardingHistoryService: DeviceOnboardingHistoryService
  ) {}

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceOnboardingHistoryResponse)
  async createDeviceOnboardingHistory(
    @Args('input') input: DeviceOnboardingHistoryInput
  ) {
    try {
      const record = await this.deviceOnboardingHistoryService.create(input);
      return {
        success: record ? 1 : 0,
        message: record
          ? 'Record created.'
          : 'Record not created. Please try again.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceOnboardingHistoryResponse)
  async fetchDeviceOnboardingHistoryList(
    @Args('input') input: DeviceOnboardingHistoryFetchInput
  ) {
    try {
      const res = await this.deviceOnboardingHistoryService.findAll(input);
      const count = await this.deviceOnboardingHistoryService.count();
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Device Onboarding History list available.',
        data: res,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
