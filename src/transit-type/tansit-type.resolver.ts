import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@imz/user/guard';
import { TransitTypeResponse } from './dto/response';
import { TransitTypeService } from './transit.service';
import {
  CreateTransitTypeInput,
  SearchTransitTypeInput,
  TransitTypeInput,
} from './dto/create-transit-type.input';
import { UpdateTransitTypeInput } from './dto/update-transit-type';

@Resolver(() => TransitTypeResponse)
export class TransitTypeResolver {
  constructor(private readonly transitTypeService: TransitTypeService) {}

  @UseGuards(new AuthGuard())
  @Mutation(() => TransitTypeResponse)
  async createTransitType(@Args('input') input: CreateTransitTypeInput) {
    try {
      const record = await this.transitTypeService.create(input);
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
  @Mutation(() => TransitTypeResponse)
  async transitTypeList(@Args('input') input: TransitTypeInput) {
    try {
      const res = await this.transitTypeService.findAll(input);
      const count = await this.transitTypeService.count();
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Transit Type list available.',
        data: res,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => TransitTypeResponse)
  async searchTransitType(@Args('input') input: SearchTransitTypeInput) {
    try {
      const { records, count } = await this.transitTypeService.searchIndustry(
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
  @Mutation(() => TransitTypeResponse)
  async updateTransitType(@Args('input') input: UpdateTransitTypeInput) {
    try {
      const record = await this.transitTypeService.update(input);
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
