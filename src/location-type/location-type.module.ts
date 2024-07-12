import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LocationTypeResolver } from './location-type.reslover';
import { LocationTypeService } from './location-type.service';
import { TenantsMiddleware } from '@imz/helper/middleware/tenants.middleware';

@Module({
  providers: [LocationTypeResolver, LocationTypeService],
  exports: [LocationTypeService],
})
export class LocationTypeModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(LocationTypeResolver);
  }
}
