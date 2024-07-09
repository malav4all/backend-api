import { Module } from '@nestjs/common';
import { DeviceGroupResolver } from './device-group.resolver';
import { DeviceGroupService } from './device-group.service';

@Module({
  providers: [DeviceGroupResolver, DeviceGroupService],
  exports: [DeviceGroupService],
})
export class DeviceGroupModule {}
