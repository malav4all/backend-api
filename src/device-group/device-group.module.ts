import { MongooseModule } from '@nestjs/mongoose';
import { DeviceGroup, DeviceGroupSchema } from './entities/device-group.entity';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DeviceGroupResolver } from './device-group.resolver';
import { DeviceGroupService } from './device-group.service';
import { TenantsMiddleware } from '@imz/helper/middleware/tenants.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeviceGroup.name, schema: DeviceGroupSchema },
    ]),
  ],
  providers: [DeviceGroupService, DeviceGroupResolver],
  exports: [DeviceGroupService],
})
export class DeviceGroupModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(DeviceGroupResolver);
  }
}
