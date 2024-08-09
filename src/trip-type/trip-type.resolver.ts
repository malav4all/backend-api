import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@imz/user/guard';
import { TripTypeResponse } from './dto/response';
import { TripTypeService } from './trip.service';
import {
  CreateTripTypeInput,
  SearchTripTypeInput,
  TripTypeInput,
} from './dto/create-trip-type.input';
import { UpdateTripTypeInput } from './dto/update-trip-type';
import { TripResponse } from '@imz/trip-module/dto/response';

@Resolver(() => TripTypeResponse)
export class TripTypeResolver {
  constructor(private readonly tripTypeService: TripTypeService) {}

  @UseGuards(new AuthGuard())
  @Mutation(() => TripTypeResponse)
  async createTripType(@Args('input') input: CreateTripTypeInput) {
    try {
      const record = await this.tripTypeService.create(input);
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
  @Mutation(() => TripTypeResponse)
  async tripTypeList(@Args('input') input: TripTypeInput) {
    try {
      const { records, count } = await this.tripTypeService.findAll(input);

      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Trip Type list available.',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => TripResponse)
  async getTripType(input: TripTypeInput) {
    try {
      const record = await this.tripTypeService.findById(input);
      return {
        success: record ? 1 : 0,
        message: record ? 'Record found.' : 'Record not found.',
        data: record,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => TripTypeResponse)
  async searchTripType(@Args('input') input: SearchTripTypeInput) {
    try {
      const { records, count } = await this.tripTypeService.searchIndustry(
        input
      );
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
  @Mutation(() => TripTypeResponse)
  async updateTripType(@Args('input') input: UpdateTripTypeInput) {
    try {
      const record = await this.tripTypeService.update(input);
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
