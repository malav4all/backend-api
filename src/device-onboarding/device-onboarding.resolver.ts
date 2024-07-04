import { Args, Mutation, Resolver, Query, Context } from '@nestjs/graphql';
import { DeviceOnboardingResponse } from './dto/response';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@imz/user/guard';
import {
  DeviceOnboardingAccountIdInput,
  DeviceOnboardingFetchInput,
  DeviceOnboardingInput,
} from './dto/create-device-onboarding.input';
import { DeviceOnboardingService } from './device-onboarding.service';
import { UpdateDeviceOnboardingInput } from './dto/update-device-onboarding.input';
import { UserResponseType } from './dto/user.response.type';
import { Request } from 'express';

@Resolver(() => DeviceOnboardingResponse)
export class DeviceOnboardingResolver {
  constructor(
    private readonly deviceOnboardingService: DeviceOnboardingService
  ) {}

  @UseGuards(new AuthGuard())
  @Mutation(() => [UserResponseType])
  async filterRecordUerAccountId(
    @Args('input') input: DeviceOnboardingAccountIdInput
  ) {
    try {
      const record = await this.deviceOnboardingService.filterRecord(
        input.accountId
      );
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceOnboardingResponse)
  async createDeviceOnboarding(
    @Args('input') input: DeviceOnboardingInput,
    @Context('req') request: Request
  ) {
    const tenantId = request.headers['x-tenant-id'].toString();
    const record = await this.deviceOnboardingService.create(input, tenantId);
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
      const getLoggedInUserDetail = context.user;
      const res = await this.deviceOnboardingService.findAll(
        input,
        getLoggedInUserDetail
      );
      const count = await this.deviceOnboardingService.count();
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Device Onboarding list available.',
        data: res,
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
}
