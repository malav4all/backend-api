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
      const res = await this.tripTypeService.findAll(input);
      const count = await this.tripTypeService.count();
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Trip Type list available.',
        data: res,
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
