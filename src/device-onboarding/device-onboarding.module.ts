import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DeviceOnboardingResolver } from './device-onboarding.resolver';
import { DeviceOnboardingService } from './device-onboarding.service';
import { DeviceOnboardingHistoryModule } from '@imz/history/device-onboarding-history/device-onboarding-history.module';
import { DeviceSimHistoryModule } from '@imz/history/device-sim-history/device-sim-history.module';
import { UserModule } from '@imz/user/user.module';
import { TenantsMiddleware } from '@imz/helper/middleware/tenants.middleware';
import { DeviceOnboarding } from './enities/device-onboarding.enities';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceOnboardingCopySchema } from './enities/device-onboarding.copy.entity';
import { RedisService } from '@imz/redis/redis.service';
import { InfluxdbService } from '@imz/influx-db/influx-db-.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeviceOnboarding.name, schema: DeviceOnboardingCopySchema },
    ]),
    DeviceOnboardingHistoryModule,
    DeviceSimHistoryModule,
    UserModule,
  ],
  providers: [
    DeviceOnboardingResolver,
    DeviceOnboardingService,
    RedisService,
    InfluxdbService,
  ],
  exports: [DeviceOnboardingService],
})
export class DeviceOnboardingModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(DeviceOnboardingResolver);
  }
}
