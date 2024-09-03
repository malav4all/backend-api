import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Trip, TripSchema } from './entity/trip-module.entity';
import { TripService } from './trip-module.service';
import { TripResolver } from './trrip-module.resolver';
import { TenantsMiddleware } from '@imz/helper/middleware/tenants.middleware';
import { InfluxdbService } from '@imz/influx-db/influx-db-.service';
import { UserModule } from '@imz/user/user.module';
import { RedisService } from '@imz/redis/redis.service';

@Module({
  imports: [UserModule],
  providers: [TripResolver, TripService, InfluxdbService, RedisService],
  exports: [TripService],
})
export class TripModuleModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(TripResolver);
  }
}
