import { AuthGuard } from '@imz/user/guard';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Subscription } from '@nestjs/graphql';
import {
  AlertInput,
  AlertReportInputType,
  CreateAlertInputType,
  DistanceReportInputType,
  SearchAlertInput,
} from './dto/create-alert.input';
import { AlertService } from './alert.service';
import {
  AlertReport,
  AlertResponseData,
  DistanceReportResponse,
} from './dto/response';
import { UpdateAlertInput } from './dto/update-alert';
import { AlertResponse } from '@imz/helper';

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
  async fetchAlert(@Args('input') input: AlertInput) {
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
  async updateAlert(@Args('input') input: UpdateAlertInput) {
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

  @UseGuards(new AuthGuard())
  @Mutation(() => AlertResponseData)
  async searchAlert(@Args('input') input: SearchAlertInput) {
    try {
      const { count, records } = await this.alertService.searchAlert(input);
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
  @Mutation(() => AlertReport)
  async getAlertData(@Args('input') input: AlertReportInputType) {
    try {
      const { rowData, totalCount } = await this.alertService.fetchAlertReport(
        input
      );
      return {
        totalCount,
        rowData,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // @UseGuards(new AuthGuard())
  @Mutation(() => [DistanceReportResponse])
  async getDistanceReportData(@Args('input') input: DistanceReportInputType) {
    try {
      const record = await this.alertService.distanceReport(input);
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
