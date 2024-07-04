import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DeviceSimHistory,
  DeviceSimHistorySchema,
} from './enitites/device-sim-history.entity';
import { DeviceSimHistoryResolver } from './device-sim-history.resolver';
import { DeviceSimHistoryService } from './device-sim-history.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeviceSimHistory.name, schema: DeviceSimHistorySchema },
    ]),
  ],
  providers: [DeviceSimHistoryResolver, DeviceSimHistoryService],
  exports: [DeviceSimHistoryService],
})
export class DeviceSimHistoryModule {}
