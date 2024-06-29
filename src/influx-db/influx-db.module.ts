import { Module } from '@nestjs/common';
import { InfluxdbService } from './influx-db-.service';

@Module({
  providers: [InfluxdbService],
  exports: [InfluxdbService],
})
export class InfluxDbModule {}
