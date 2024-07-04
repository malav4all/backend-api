import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DeviceOnboardingHistory,
  DeviceOnboardingHistorySchema,
} from './enities/device-onboarding-history.enities';
import { DeviceOnboardingHistoryResolver } from './device-onboarding-history.resolver';
import { DeviceOnboardingHistoryService } from './device-onboarding-history.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DeviceOnboardingHistory.name,
        schema: DeviceOnboardingHistorySchema,
      },
    ]),
  ],
  providers: [DeviceOnboardingHistoryResolver, DeviceOnboardingHistoryService],
  exports: [DeviceOnboardingHistoryService],
})
export class DeviceOnboardingHistoryModule {}
