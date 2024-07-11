import { AuthGuard } from '@imz/user/guard';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { DeviceGroupService } from './device-group.service';
import {
  CreateDeviceGroupInput,
  DeviceGroupInput,
  SearchDeviceGroupInput,
} from './dto/create-device-group.input';
import { DeviceGroupResponse } from './dto/response';
import { UpdateDeviceGroupInput } from './dto/update-device-group.input';

@Resolver(() => DeviceGroupResponse)
export class DeviceGroupResolver {
  constructor(private readonly deviceGroupService: DeviceGroupService) {}

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceGroupResponse)
  async createDeviceGroup(@Args('input') input: CreateDeviceGroupInput) {
    try {
      const record = await this.deviceGroupService.create(input);
      return {
        success: record ? 1 : 0,
        message: record
          ? 'Device Group Created Successfully.'
          : 'Failed to Create Device Group.',
      };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceGroupResponse)
  async fetchDeviceGroup(@Args('input') input: DeviceGroupInput) {
    try {
      const { count, records } =
        await this.deviceGroupService.findAllDeviceGroupsWithImeis(input);
      const success = records.length > 0 ? 1 : 0;
      return {
        paginatorInfo: {
          count,
        },
        success: success,
        message: success ? 'list available.' : 'No data found.',
        data: records,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceGroupResponse)
  async searchDeviceGroup(@Args('input') input: SearchDeviceGroupInput) {
    try {
      const { records, count } =
        await this.deviceGroupService.searchDeviceGroup(input);
      const success = records.length > 0 ? 1 : 0;
      return {
        paginatorInfo: {
          count,
        },
        success: success,
        message: success
          ? 'Device Group list available.'
          : 'No Device Group list available.',
        data: records,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceGroupResponse)
  async updateDeviceGroup(@Args('input') input: UpdateDeviceGroupInput) {
    try {
      const record = await this.deviceGroupService.update(input);
      return {
        success: record ? 1 : 0,
        message: record
          ? 'Device Group has been update successfully.'
          : 'Technical issue please try agian.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => DeviceGroupResponse)
  async fetchDeviceGroupById(@Args('input') input: DeviceGroupInput) {
    try {
      const { count, records } =
        await this.deviceGroupService.fetchDeviceGroupById(input);
      const success = records.length > 0 ? 1 : 0;
      return {
        paginatorInfo: {
          count,
        },
        success: success,
        message: success ? 'list available.' : 'No data found.',
        data: records,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
