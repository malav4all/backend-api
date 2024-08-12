import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DeviceGroupResolver } from './device-group.resolver';
import { DeviceGroupService } from './device-group.service';
import { TenantsMiddleware } from '@imz/helper/middleware/tenants.middleware';
import { UserService } from '@imz/user/user.service';
import { UserModule } from '@imz/user/user.module';

@Module({
  imports: [UserModule],
  providers: [DeviceGroupService, DeviceGroupResolver],
  exports: [DeviceGroupService],
})
export class DeviceGroupModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(DeviceGroupResolver);
  }
}
