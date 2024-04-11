import { Resolver, Mutation, Subscription, Args } from '@nestjs/graphql';
import { InfluxService } from './influx-db.connection';
import {
  AlertInputType,
  AlertResponseTableData,
  DeviceStatus,
  DistanceReportResponse,
  TrackPlayResponse,
} from './response';
import { InternalServerErrorException } from '@nestjs/common';

@Resolver()
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

  @Mutation(() => [AlertResponseTableData])
  async getAlertData(@Args('input') input: AlertInputType) {
    const res = await this.influxService.fetchDataAndPublish(input);
    return res;
  }

  @Mutation(() => [DeviceStatus])
  async getStatusDevice(@Args('input') input: AlertInputType) {
    const res = await this.influxService.fetchDataDeviceStatus(input);
    return res;
  }

  @Mutation(() => [DistanceReportResponse])
  async fetchDistanceReport(@Args('input') input: AlertInputType) {
    const res = await this.influxService.distanceReportQuery(input);
    return res;
  }
}
