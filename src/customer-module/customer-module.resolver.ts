import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CustomerModuleService } from './customer-module.service';
import {
  CreateCustomerModuleInput,
  CustomerModuleExitsInput,
  CustomerModuleInput,
  SearchInput,
} from './dto/create-customer-module.input';
import { CustomerModuleResponse } from './dto/response';
import { AuthGuard } from '@imz/user/guard';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { UpdateCustomerModuleInput } from './dto/update-customer-module.input';

@Resolver(() => CustomerModuleResponse)
export class CustomerModuleResolver {
  constructor(private readonly customerModuleService: CustomerModuleService) {}

  @UseGuards(new AuthGuard())
  @Mutation(() => CustomerModuleResponse)
  async createCustomerModule(@Args('input') input: CreateCustomerModuleInput) {
    try {
      const record = await this.customerModuleService.create(input);
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
  @Mutation(() => CustomerModuleResponse)
  async customerModuleListAll(@Args('input') input: CustomerModuleInput) {
    try {
      const res = await this.customerModuleService.findAll(input);
      const count = await this.customerModuleService.count();
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Customer Module list available.',
        data: res,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => CustomerModuleResponse)
  async updateRole(@Args('input') input: UpdateCustomerModuleInput) {
    try {
      const record = await this.customerModuleService.update(input);
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

  @UseGuards(new AuthGuard())
  @Mutation(() => CustomerModuleResponse)
  async searchCustomerModule(@Args('input') input: SearchInput) {
    try {
      const { records, count } =
        await this.customerModuleService.searchCustomerModule(input);
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

  @Mutation(() => CustomerModuleResponse)
  @UseGuards(new AuthGuard())
  async checkCustomerModuleExistsRecord(
    @Args('input') input: CustomerModuleExitsInput
  ) {
    try {
      const record = await this.customerModuleService.checkExistsRecord(input);
      return {
        success: record ? 1 : 0,
        message: record ? `This Record exists.` : 'Record not exists.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
