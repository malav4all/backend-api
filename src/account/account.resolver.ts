import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { AuthGuard } from '@imz/user/guard';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AccountResponse } from './dto/response';
import {
  AccountInput,
  CreateAccountInput,
  SearchAccountInput,
} from './dto/create-account-module.input';
import { UpdateAccountInput } from './dto/update.account-module';
import { AccountService } from './account.service';

@Resolver(() => AccountResponse)
export class AccountResolver {
  constructor(private readonly accountModuleService: AccountService) {}

  @UseGuards(new AuthGuard())
  @Mutation(() => AccountResponse)
  async createAccount(
    @Args('input') input: CreateAccountInput,
    @Context() context
  ) {
    try {
      const getLoggedInUserDetail = context.user;
      const record = await this.accountModuleService.create(
        input,
        getLoggedInUserDetail
      );
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
  @Mutation(() => AccountResponse)
  async updateAccount(@Args('input') input: UpdateAccountInput) {
    try {
      const record = await this.accountModuleService.update(input);
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
  @Mutation(() => AccountResponse)
  async deleteAccount(@Args('input') input: UpdateAccountInput) {
    try {
      const record = await this.accountModuleService.softDelete(input);
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

  @UseGuards(new AuthGuard())
  @Mutation(() => AccountResponse)
  async searchAccount(@Args('input') input: SearchAccountInput) {
    try {
      const { records, count } = await this.accountModuleService.searchAccount(
        input
      );
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Account list available.',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Query(() => AccountResponse)
  async fetchAccountList(
    @Args('input') input: AccountInput,
    @Context() context
  ) {
    try {
      const loggedInAccount = {
        accountId: context?.user?.accountId,
        roleId: context?.user?.roleId,
      };
      const { records, count } = await this.accountModuleService.findAll(
        input,
        loggedInAccount
      );
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Account list available.',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => AccountResponse)
  async fetchAccountModuleList(
    @Args('input') input: AccountInput,
    @Context() context
  ) {
    try {
      const loggedInAccount = {
        accountId: context?.user?.accountId,
        roleId: context?.user?.roleId,
      };
      const { records, count } = await this.accountModuleService.findAll(
        input,
        loggedInAccount
      );
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Account list available.',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
