import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JourneyResolver } from './journey.resolver';
import { JourneyService } from './journey.service';
import { Journey, JourneySchema } from './entity/journey.entity';
import { TenantsMiddleware } from '@imz/helper/middleware/tenants.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Journey.name, schema: JourneySchema }]),
  ],
  providers: [JourneyResolver, JourneyService],
  exports: [JourneyService],
})
export class JourneyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(JourneyResolver);
  }
}
