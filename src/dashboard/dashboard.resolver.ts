import { Mutation, Resolver } from '@nestjs/graphql';
import { DashboardResponse } from './dto/response';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '@imz/user/guard';

@Resolver(() => DashboardResponse)
export class DashboardResolver {
  constructor(private dashboardService: DashboardService) {}

  @UseGuards(new AuthGuard())
  @Mutation(() => DashboardResponse)
  async fetchDashboardDetail() {
    try {
      const records = await this.dashboardService.getDashboardDetail();
      return {
        data: records.total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
