import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RouteResolver } from './route.resolver';
import { RouteService } from './route.service';
import { TenantsMiddleware } from '@imz/helper/middleware/tenants.middleware';

@Module({
  providers: [RouteResolver, RouteService],
  exports: [RouteService],
})
export class RouteModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(RouteResolver);
  }
}
