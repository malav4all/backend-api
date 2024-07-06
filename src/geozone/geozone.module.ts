import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GeozoneSchema, Geozone } from './enitity/geozone.entity';
import { GeozoneResolver } from './geozone.resolver';
import { GeozoneService } from './geozone.service';
import { TenantsMiddleware } from '@imz/helper/middleware/tenants.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Geozone.name, schema: GeozoneSchema }]),
  ],
  providers: [GeozoneResolver, GeozoneService],
  exports: [GeozoneService],
})
export class GeozoneModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(GeozoneResolver);
  }
}
