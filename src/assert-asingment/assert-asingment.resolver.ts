import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthGuard } from '@imz/user/guard';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AssertAssingmentModuleResponse } from './dto/response';
import { AssertAssingmentModuleService } from './assert-asingment.service';
import {
  AssertAssingmentModuleInput,
  CheckAssertAssingmentModuleInput,
  CreateAssertAssingmentModuleInput,
  SearchAssertAssingmentModuleInput,
} from './dto/create-assert-asingment.input';
import { UpdateAssertAssingmentModuleInput } from './dto/update.assert-asingment';

@Resolver(() => AssertAssingmentModuleResponse)
export class AssertAssingmentResolver {
  constructor(
    private readonly assertAssingmentModuleService: AssertAssingmentModuleService
  ) {}

  // @UseGuards(new AuthGuard())
  @Mutation(() => AssertAssingmentModuleResponse)
  async createAssertAssingmentModule(
    @Args('input') input: CreateAssertAssingmentModuleInput
  ) {
    try {
      const record = await this.assertAssingmentModuleService.create(input);
      return {
        success: record ? 1 : 0,
        message: record
          ? 'Assert Record created.'
          : 'Assert Record not created. Please try again.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // @UseGuards(new AuthGuard())
  @Mutation(() => AssertAssingmentModuleResponse)
  async updateAssertAssingmentModule(
    @Args('input') input: UpdateAssertAssingmentModuleInput
  ) {
    try {
      const record = await this.assertAssingmentModuleService.update(input);
      return {
        success: record ? 1 : 0,
        message: record
          ? 'Records update successfully.'
          : 'Technical issue please try agian.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // @UseGuards(new AuthGuard())
  @Mutation(() => AssertAssingmentModuleResponse)
  async deleteAssertAssingmentModule(
    @Args('input') input: UpdateAssertAssingmentModuleInput
  ) {
    try {
      const record = await this.assertAssingmentModuleService.softDelete(input);
      return {
        success: record ? 1 : 0,
        message: record
          ? 'Records Delete successfully.'
          : 'Technical issue please try again.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // @UseGuards(new AuthGuard())
  @Mutation(() => AssertAssingmentModuleResponse)
  async searchAssertAssingmentModule(
    @Args('input') input: SearchAssertAssingmentModuleInput
  ) {
    try {
      const { records, count } =
        await this.assertAssingmentModuleService.searchAssertAssingmentModel(
          input
        );
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Assert Module list available.',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // @UseGuards(new AuthGuard())
  @Mutation(() => AssertAssingmentModuleResponse)
  async checkAssertAssingmentModuleExistsRecord(
    @Args('input') input: CheckAssertAssingmentModuleInput
  ) {
    try {
      const record = await this.assertAssingmentModuleService.checkExistsRecord(
        input
      );
      return {
        success: record ? 1 : 0,
        message: record ? 'Record exists.' : 'Record not exists.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // @UseGuards(new AuthGuard())
  @Mutation(() => AssertAssingmentModuleResponse)
  async fetchAssertAssingmentModule(
    @Args('input') input: AssertAssingmentModuleInput
  ) {
    try {
      const res = await this.assertAssingmentModuleService.findAll(input);
      const count = await this.assertAssingmentModuleService.count();
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Assert  list available.',
        data: res,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
