import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { DeviceSimHistoryResponse } from './dto/response';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@imz/user/guard';
import {
  DeviceSimHistoryFetchInput,
  DeviceSimHistoryInput,
} from './dto/create-device-sim-history';
import { DeviceSimHistoryService } from './device-sim-history.service';

@Resolver(() => DeviceSimHistoryResponse)
export class DeviceSimHistoryResolver {
  constructor(
    private readonly deviceSimHistoryService: DeviceSimHistoryService
  ) {}

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceSimHistoryResponse)
  async createDeviceSimHistory(@Args('input') input: DeviceSimHistoryInput) {
    try {
      const record = await this.deviceSimHistoryService.create(input);
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
  @Mutation(() => DeviceSimHistoryResponse)
  async fetchDeviceSimHistoryList(
    @Args('input') input: DeviceSimHistoryFetchInput
  ) {
    try {
      const res = await this.deviceSimHistoryService.findAll(input);
      const count = await this.deviceSimHistoryService.count();
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Device Sim History list available.',
        data: res,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
