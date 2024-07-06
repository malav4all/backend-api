import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AlertSchema, Alert } from './entity/alert.entity';
import { AlertResolver } from './alert.resolver';
import { AlertService } from './alert.service';
import { RedisService } from '@imz/redis/redis.service';
import { TenantsMiddleware } from '@imz/helper/middleware/tenants.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Alert.name, schema: AlertSchema }]),
  ],

  providers: [AlertResolver, AlertService, RedisService],
  exports: [AlertService],
})
export class AlertModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(AlertResolver);
  }
}
