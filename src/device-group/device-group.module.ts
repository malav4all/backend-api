import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceGroupService } from './device-group.service';
import { DeviceGroupResolver } from './device-group.resolver';
import { DeviceGroup, DeviceGroupSchema } from './entities/device-group.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeviceGroup.name, schema: DeviceGroupSchema },
    ]),
  ],
  providers: [DeviceGroupService, DeviceGroupResolver],
  exports: [DeviceGroupService],
})
export class DeviceGroupModule {}
