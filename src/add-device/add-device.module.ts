import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AddDeviceService } from './add-device.service';
import { AddDeviceResolver } from './add-device.reslover';
import { AddDevice, AddDeviceSchema } from './entity/add-device.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AddDevice.name, schema: AddDeviceSchema },
    ]),
  ],
  providers: [AddDeviceResolver, AddDeviceService],
  exports: [AddDeviceService],
})
export class AddDeviceModule {}
