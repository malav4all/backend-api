import { MongooseModule } from '@nestjs/mongoose';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TenantsMiddleware } from '@imz/helper/middleware/tenants.middleware';
import { Entites, EntitesSchema } from './entity/entites.type';
import { EntitesResolver } from './entites.resolver';
import { EntitesService } from './entites.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Entites.name, schema: EntitesSchema }]),
  ],
  providers: [EntitesResolver, EntitesService],
  exports: [EntitesService],
})
export class EntitesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(EntitesResolver);
  }
}
