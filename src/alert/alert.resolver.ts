import { AuthGuard } from '@imz/user/guard';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AlertInput, CreateAlertInputType } from './dto/create-alert.input';
import { AlertService } from './alert.service';
import { AlertResponseData } from './dto/response';
import { UpdateAlertInput } from './dto/update-alert';

@Resolver(() => AlertResponseData)
export class AlertResolver {
  constructor(private readonly alertService: AlertService) {}

  @UseGuards(new AuthGuard())
  @Mutation(() => AlertResponseData)
  async addAlert(@Args('input') input: CreateAlertInputType) {
    try {
      const record = await this.alertService.create(input);
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
  @Mutation(() => AlertResponseData)
  async userListAll(@Args('input') input: AlertInput) {
    try {
      const { count, records } = await this.alertService.findAll(input);
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Alert list available.',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => AlertResponseData)
  async updateUser(@Args('input') input: UpdateAlertInput) {
    try {
      const record = await this.alertService.update(input);
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
