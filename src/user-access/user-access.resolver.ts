import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@imz/user/guard';
import { UserAccessResponse } from './dto/response';
import {
  CreateUserAccessInput,
  SearchUserAccessInput,
  UserAccessInput,
} from './dto/create-user-access.input';
import { UserAccessService } from './user-access.service';

@Resolver(() => UserAccessResponse)
export class UserAccessResolver {
  constructor(private readonly userAccessService: UserAccessService) {}

  @UseGuards(new AuthGuard())
  @Mutation(() => UserAccessResponse)
  async addEntityType(@Args('input') input: CreateUserAccessInput) {
    try {
      const record = await this.userAccessService.create(input);
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
  @Mutation(() => UserAccessResponse)
  async fetchEntityType(@Args('input') input: UserAccessInput) {
    try {
      const { count, records } = await this.userAccessService.findAll(input);
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

  @Mutation(() => UserAccessResponse)
  async searchEntity(@Args('input') input: SearchUserAccessInput) {
    try {
      const { records, count } = await this.userAccessService.searchLocations(
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
