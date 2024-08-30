import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@imz/user/guard';
import { EntitesResponse } from './dto/response';
import {
  CreateEntitesInput,
  EntitesTypeInput,
  SearchEntitesInput,
} from './dto/create-entites.input';
import { EntitesService } from './entites.service';
import { UpdateEntitesInput } from './dto/update.entites.input';

@Resolver(() => EntitesResponse)
export class EntitesResolver {
  constructor(private readonly entitesService: EntitesService) {}

  @UseGuards(new AuthGuard())
  @Mutation(() => EntitesResponse)
  async addEntitesType(@Args('input') input: CreateEntitesInput) {
    try {
      const record = await this.entitesService.create(input);
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
  @Mutation(() => EntitesResponse)
  async fetchEntitesType(@Args('input') input: EntitesTypeInput) {
    try {
      const { count, records } = await this.entitesService.findAll(input);
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

  @UseGuards(new AuthGuard())
  @Mutation(() => EntitesResponse)
  async fetchEntityByTripTypeAndType(@Args('input') input: EntitesTypeInput) {
    try {
      const { count, records } =
        await this.entitesService.fetchEntityByTripTypeAndType(input);
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

  @UseGuards(new AuthGuard())
  @Mutation(() => EntitesResponse)
  async searchEntity(@Args('input') input: SearchEntitesInput) {
    try {
      const { records, count } = await this.entitesService.searchEntity(input);
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
  @Mutation(() => EntitesResponse)
  async updateEntityType(@Args('input') input: UpdateEntitesInput) {
    try {
      const record = await this.entitesService.update(input);
      return {
        success: record ? 1 : 0,
        message: record
          ? 'Record Update Successfully.'
          : 'Record not created. Please try again.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
