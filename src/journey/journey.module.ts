import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JourneyResolver } from './journey.resolver';
import { JourneyService } from './journey.service';
import { TenantsMiddleware } from '@imz/helper/middleware/tenants.middleware';

@Module({
  providers: [JourneyResolver, JourneyService],
  exports: [JourneyService],
})
export class JourneyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(JourneyResolver);
  }
}
