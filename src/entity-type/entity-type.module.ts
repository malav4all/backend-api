import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EntityTypeResolver } from './entity-type.reslover';
import { EntityTypeService } from './entity-type.service';
import { TenantsMiddleware } from '@imz/helper/middleware/tenants.middleware';

@Module({
  providers: [EntityTypeResolver, EntityTypeService],
  exports: [EntityTypeService],
})
export class EntityTypeModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(EntityTypeResolver);
  }
}
