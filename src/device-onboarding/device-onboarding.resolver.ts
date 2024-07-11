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
    @Args('input') input: DeviceOnboardingFetchInput
  ) {
    try {
      const { records, count } = await this.deviceOnboardingService.findAll(
        input
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
    // try {
    //   const record = await this.deviceOnboardingService.update(input);
    //   return {
    //     success: record ? 1 : 0,
    //     message: record
    //       ? 'Records update successfully.'
    //       : 'Technical issue please try agian.',
    //   };
    // } catch (error) {
    //   throw new InternalServerErrorException(error.message);
    // }
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
}
