import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { LocationTypeResponse } from './dto/response';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@imz/user/guard';
import {
  CreateLocationTypeInput,
  LocationTypeInput,
  SearchLocationsInput,
} from './dto/create-location-type.input';
import { LocationTypeService } from './location-type.service';

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
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => LocationTypeResponse)
  async fetchLocationType(@Args('input') input: LocationTypeInput) {
    try {
      const { count, records } = await this.locationTypeService.findAll(input);
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

  @Mutation(() => LocationTypeResponse)
  async searchLocations(@Args('input') input: SearchLocationsInput) {
    try {
      const { records, count } = await this.locationTypeService.searchLocations(
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
}
