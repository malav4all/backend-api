import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Trip, TripSchema } from './entity/trip-module.entity';
import { TripService } from './trip-module.service';
import { TripResolver } from './trrip-module.resolver';
import { TenantsMiddleware } from '@imz/helper/middleware/tenants.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]),
  ],
  providers: [TripResolver, TripService],
  exports: [TripService],
})
export class TripModuleModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(TripResolver);
  }
}
