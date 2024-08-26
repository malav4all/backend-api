import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { LocationTypeResponse } from './dto/response';
import {
  ConflictException,
  InternalServerErrorException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@imz/user/guard';
import {
  CreateLocationTypeInput,
  LocationTypeInput,
  SearchLocationsInput,
} from './dto/create-location-type.input';
import { LocationTypeService } from './location-type.service';
import { UpdateLocationTypeInput } from './dto/update-location-type.input';

@Resolver(() => LocationTypeResponse)
export class LocationTypeResolver {
  constructor(private readonly locationTypeService: LocationTypeService) {}

  @UseGuards(new AuthGuard())
  @Mutation(() => LocationTypeResponse)
  async addLocationType(@Args('input') input: CreateLocationTypeInput) {
    try {
      const record = await this.locationTypeService.create(input);
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
  @Mutation(() => LocationTypeResponse)
  async fetchLocationType(@Args('input') input: LocationTypeInput) {
    try {
      const { count, records } = await this.locationTypeService.findAll(input);
      const success = records.length > 0 ? 1 : 0;
      return {
        paginatorInfo: {
          count,
        },
        success: success,
        message: success ? 'List available.' : 'No data found.',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => LocationTypeResponse)
  async updateLocationType(@Args('input') input: UpdateLocationTypeInput) {
    try {
      const record = await this.locationTypeService.update(input);
      return {
        success: record ? 1 : 0,
        message: record
          ? 'Records updated successfully.'
          : 'Technical issue, please try again.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => LocationTypeResponse)
  async searchLocationTypes(@Args('input') input: SearchLocationsInput) {
    try {
      const { records, count } =
        await this.locationTypeService.searchLocationTypes(input);
      const success = records.length > 0 ? 1 : 0;
      return {
        paginatorInfo: {
          count,
        },
        success: success,
        message: success
          ? 'Location type list available.'
          : 'No location type found.',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
