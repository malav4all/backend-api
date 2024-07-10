import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// import { AccountService } from './account.service';
// import { AccountResolver } from './account.resolver';

import { DeviceModel, DeviceModelSchema } from './entities/device-model.entity';
import { DeviceModelResolver } from './device-model.resolver';
import { DeviceModelService } from './device-model.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeviceModel.name, schema: DeviceModelSchema },
    ]),
  ],
  providers: [DeviceModelResolver, DeviceModelService],
  exports: [DeviceModelService],
})
export class DeviceModelModule {}
