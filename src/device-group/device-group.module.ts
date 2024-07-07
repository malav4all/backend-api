import { Module } from '@nestjs/common';
import { DeviceGroup, DeviceGroupSchema } from './entities/device-group.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceGroupResolver } from './device-group.resolver';
import { DeviceGroupService } from './device-group.service';
import {
  AssertAssingmentModuleEntity,
  AssertAssingmentModuleSchema,
} from '@imz/assert-asingment/entities/assert-asingment.enitiy';
@Module({
  providers: [DeviceGroupResolver, DeviceGroupService],
  exports: [DeviceGroupService],
})
export class DeviceGroupModule {}
