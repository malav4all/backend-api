import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EntityType, EntityTypeSchema } from './entity/entity-type.entity';
import { EntityTypeResolver } from './entity-type.reslover';
import { EntityTypeService } from './entity-type.service';
import { TenantsMiddleware } from '@imz/helper/middleware/tenants.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EntityType.name, schema: EntityTypeSchema },
    ]),
  ],
  providers: [EntityTypeResolver, EntityTypeService],
  exports: [EntityTypeService],
})
export class EntityTypeModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(EntityTypeResolver);
  }
}
