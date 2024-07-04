import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@imz/user/guard';
import { TripResponse } from './dto/response';
import { TripService } from './trip-module.service';
import {
  CreateTripInput,
  SearchTripInput,
  TripInput,
} from './dto/create-trip-module.input';
import { UpdateTripInput } from './dto/update-trip-module.update';

@Resolver(() => TripResponse)
export class TripResolver {
  constructor(private readonly tripService: TripService) {}

  @UseGuards(new AuthGuard())
  @Mutation(() => TripResponse)
  async createTrip(@Args('input') input: CreateTripInput) {
    try {
      const { tripId, record } = await this.tripService.create(input);
      return {
        success: record ? 1 : 0,
        message: record
          ? `Trip created Successful - ${tripId}`
          : 'Record not created. Please try again.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => TripResponse)
  async tripList(@Args('input') input: TripInput) {
    try {
      const res = await this.tripService.findAll(input);
      const count = await this.tripService.count();
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Trip list available.',
        data: res,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => TripResponse)
  async searchTrip(@Args('input') input: SearchTripInput) {
    try {
      const { records, count } = await this.tripService.searchTrip(input);
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Search list available.',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => TripResponse)
  async updateTrip(@Args('input') input: UpdateTripInput) {
    try {
      const record = await this.tripService.update(input);
      return {
        success: record ? 1 : 0,
        message: record
          ? 'Records update successfully.'
          : 'Technical issue please try again.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
