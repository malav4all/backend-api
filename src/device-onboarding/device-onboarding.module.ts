import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DeviceOnboardingSchema,
  DeviceOnboarding,
} from './enities/device-onboarding.enities';
import { DeviceOnboardingResolver } from './device-onboarding.resolver';
import { DeviceOnboardingService } from './device-onboarding.service';
import { DeviceOnboardingHistoryModule } from '@imz/history/device-onboarding-history/device-onboarding-history.module';
import { DeviceSimHistoryModule } from '@imz/history/device-sim-history/device-sim-history.module';
import { UserModule } from '@imz/user/user.module';
import { TenantsMiddleware } from '@imz/helper/middleware/tenants.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeviceOnboarding.name, schema: DeviceOnboardingSchema },
    ]),
    DeviceOnboardingHistoryModule,
    DeviceSimHistoryModule,
    UserModule,
  ],
  providers: [DeviceOnboardingResolver, DeviceOnboardingService],
  exports: [DeviceOnboardingService],
})
export class DeviceOnboardingModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(DeviceOnboardingResolver);
  }
}
