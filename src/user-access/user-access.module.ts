import { TenantsMiddleware } from '@imz/helper/middleware/tenants.middleware';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserAccessResolver } from './user-access.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccessService } from './user-access.service';
import { UserAccess, UserAccessSchema } from './entity/user-access.type';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserAccess.name, schema: UserAccessSchema },
    ]),
  ],
  providers: [UserAccessResolver, UserAccessService],
  exports: [UserAccessService],
})
export class UserAccessModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(UserAccessResolver);
  }
}
