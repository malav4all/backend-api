import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
  ConflictException,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@imz/user/guard';
import { AddDeviceService } from './add-device.service';
import { AddDeviceResponse } from './dto/response';
import {
  AddDeviceInput,
  CreateAddDeviceInput,
  SearchAddDeviceInput,
} from './dto/add-device.input';
import { UpdateAddDeviceInput } from './dto/update.add-device.input';

@Resolver(() => AddDeviceResponse)
export class AddDeviceResolver {
  constructor(private readonly addDeviceService: AddDeviceService) {}

  @UseGuards(new AuthGuard())
  @Mutation(() => AddDeviceResponse)
  async addDeviceList(@Args('input') input: CreateAddDeviceInput) {
    try {
      const record = await this.addDeviceService.create(input);
      return {
        success: record ? 1 : 0,
        message: record
          ? 'Record created.'
          : 'Record not created. Please try again.',
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => AddDeviceResponse)
  async fetchDeviceList(@Args('input') input: AddDeviceInput) {
    try {
      const { count, records } = await this.addDeviceService.findAll(input);
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'list available.',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Mutation(() => AddDeviceResponse)
  @UseGuards(new AuthGuard())
  async searchDeviceList(@Args('input') input: SearchAddDeviceInput) {
    try {
      const { records, count } = await this.addDeviceService.searchDeviceList(
        input
      );
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Location list available.',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => AddDeviceResponse)
  async updateDeviceList(@Args('input') input: UpdateAddDeviceInput) {
    try {
      const record = await this.addDeviceService.update(input);
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
  @Mutation(() => AddDeviceResponse)
  async bulkUploadDevice(
    @Args('input', { type: () => [CreateAddDeviceInput] })
    input: CreateAddDeviceInput[]
  ) {
    try {
      const result = await this.addDeviceService.bulkDeviceUpload(input);

      if (result.successCount === 0) {
        throw new ConflictException(
          `All records are duplicates. None of the ${result.duplicateCount} records were processed.`
        );
      }

      return {
        success: result.successCount > 0 ? 1 : 0,
        message:
          result.successCount > 0
            ? `Record uploaded successfully. ${result.duplicateCount} duplicate(s) were skipped.`
            : 'No records were uploaded. Please try again.',
        data: result.data,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
