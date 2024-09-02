import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { DeviceModelResponse } from './dto/response';
import { UpdateDeviceModelInput } from './dto/update-device-model.input';
import {
  CreateDeviceModelInput,
  DeviceModelInput,
  SearchDeviceModel,
  checkDeviceModelInput,
} from './dto/create-device-model.input';
import { DeviceModelService } from './device-model.service';
import { AuthGuard } from '@imz/user/guard';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';

@Resolver(() => DeviceModelResponse)
export class DeviceModelResolver {
  constructor(private readonly deviceModelService: DeviceModelService) {}

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceModelResponse)
  async createDeviceModel(@Args('input') input: CreateDeviceModelInput) {
    try {
      const record = await this.deviceModelService.create(input);
      return {
        success: record ? 1 : 0,
        message: record
          ? 'Device Record created.'
          : 'Device Record not created. Please try again.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceModelResponse)
  async updateDeviceModel(@Args('input') input: UpdateDeviceModelInput) {
    try {
      const record = await this.deviceModelService.update(input);
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
  @Mutation(() => DeviceModelResponse)
  async deleteDeviceModel(@Args('input') input: UpdateDeviceModelInput) {
    try {
      const record = await this.deviceModelService.softDelete(input);
      return {
        success: record ? 1 : 0,
        message: record
          ? 'Records Delete successfully.'
          : 'Technical issue please try again.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // @UseGuards(new AuthGuard())
  @Mutation(() => DeviceModelResponse)
  async searchDeviceModel(@Args('input') input: SearchDeviceModel) {
    try {
      const { records, count } =
        await this.deviceModelService.searchDeviceModel(input);
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Device Module list available.',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceModelResponse)
  async checkDeviceModelExistsRecord(
    @Args('input') input: checkDeviceModelInput
  ) {
    try {
      const record = await this.deviceModelService.checkExistsRecord(input);
      return {
        success: record ? 1 : 0,
        message: record ? 'Record exists.' : 'Record not exists.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceModelResponse)
  async fetchDeviceModel(@Args('input') input: DeviceModelInput) {
    try {
      const res = await this.deviceModelService.findAll(input);
      const count = await this.deviceModelService.count();
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Device  list available.',
        data: res,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
