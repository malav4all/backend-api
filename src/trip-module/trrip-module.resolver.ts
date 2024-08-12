import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@imz/user/guard';
import {
  BatteryResponse,
  TripMetricsResponseWrapper,
  TripResponse,
} from './dto/response';
import { TripService } from './trip-module.service';
import {
  BatteryCheckInput,
  CreateTripInput,
  SearchTripInput,
  TripIDInput,
  TripInput,
  TripStausInput,
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
      const { count, records } = await this.tripService.findAll(input);
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Trip list available.',
        data: records,
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
  async fetchTripById(@Args('input') input: TripIDInput) {
    try {
      const record = await this.tripService.getTripDetailById(input);
      return {
        success: 1,
        message: 'Search list available.',
        data: [record],
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

  @Mutation(() => BatteryResponse)
  async checkBattery(
    @Args('input') input: BatteryCheckInput
  ): Promise<{ success: boolean; message: string }> {
    return this.tripService.checkBatteryPercentage(input);
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => TripMetricsResponseWrapper)
  async getTripStatusMetrics(@Args('input') input: TripInput) {
    try {
      const metrics = await this.tripService.getTripStatusMetrics(
        input.accountId
      );
      return {
        success: 1,
        message: 'Trip status metrics retrieved successfully.',
        data: metrics,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // @UseGuards(new AuthGuard())
  @Mutation(() => TripResponse)
  async updateTripStatus(@Args('input') input: TripStausInput) {
    try {
      const updatedTrip = await this.tripService.updateTripStatus(
        input.accountId,
        input.tripId,
        input.status
      );
      return {
        success: 1,
        message: `Trip with ID ${updatedTrip.tripId} successfully updated to status ${updatedTrip.status}`,
        data: [updatedTrip],
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
