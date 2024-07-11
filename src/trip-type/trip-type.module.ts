import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TripTypeService } from './trip.service';
import { TripTypeResolver } from './trip-type.resolver';
import { TenantsMiddleware } from '@imz/helper/middleware/tenants.middleware';

@Module({
  providers: [TripTypeResolver, TripTypeService],
  exports: [TripTypeService],
})
export class TripTypeModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(TripTypeResolver);
  }
}
