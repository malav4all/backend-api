import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@imz/user/guard';
import { EntityTypeResponse } from './dto/response';
import {
  CreateEntityTypeInput,
  EntityTypeInput,
  SearchEntityInput,
} from './dto/create-entity-type.input';
import { EntityTypeService } from './entity-type.service';

@Resolver(() => EntityTypeResponse)
export class EntityTypeResolver {
  constructor(private readonly entityTypeService: EntityTypeService) {}

  @UseGuards(new AuthGuard())
  @Mutation(() => EntityTypeResponse)
  async addEntityType(@Args('input') input: CreateEntityTypeInput) {
    try {
      const record = await this.entityTypeService.create(input);
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
  @Mutation(() => EntityTypeResponse)
  async fetchEntityType(@Args('input') input: EntityTypeInput) {
    try {
      const { count, records } = await this.entityTypeService.findAll(input);
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

  @Mutation(() => EntityTypeResponse)
  async searchEntity(@Args('input') input: SearchEntityInput) {
    try {
      const { records, count } = await this.entityTypeService.searchLocations(
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
