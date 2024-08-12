import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AlertResolver } from './alert.resolver';
import { AlertService } from './alert.service';
import { RedisService } from '@imz/redis/redis.service';
import { TenantsMiddleware } from '@imz/helper/middleware/tenants.middleware';
import { InfluxdbService } from '@imz/influx-db/influx-db-.service';
import { UserModule } from '@imz/user/user.module';

@Module({
  imports: [UserModule],
  providers: [AlertResolver, AlertService, RedisService, InfluxdbService],
  exports: [AlertService],
})
export class AlertModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(AlertResolver);
  }
}
