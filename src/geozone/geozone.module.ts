import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GeozoneResolver } from './geozone.resolver';
import { GeozoneService } from './geozone.service';
import { TenantsMiddleware } from '@imz/helper/middleware/tenants.middleware';

@Module({
  providers: [GeozoneResolver, GeozoneService],
  exports: [GeozoneService],
})
export class GeozoneModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(GeozoneResolver);
  }
}
