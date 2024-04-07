import { Resolver, Mutation, Subscription } from '@nestjs/graphql';
import { InfluxService } from './influx-db.connection';
import { TrackPlayResponse } from './response';
import { InternalServerErrorException } from '@nestjs/common';

@Resolver(() => TrackPlayResponse)
export class InfluxResolver {
  constructor(private readonly influxService: InfluxService) {}

  @Mutation(() => [TrackPlayResponse])
  async getRowData() {
    try {
      const res = await this.influxService.executeQuery();
      return res;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Subscription(() => TrackPlayResponse)
  async getAlertData() {
    return await this.influxService.getExecuteAlertData();
  }
}
