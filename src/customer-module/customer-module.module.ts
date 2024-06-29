import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CustomerModuleSchema,
  CustomerModule,
} from './enities/customer-module.enitiy';
import { CustomerModuleService } from './customer-module.service';
import { CustomerModuleResolver } from './customer-module.resolver';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CustomerModule.name, schema: CustomerModuleSchema },
    ]),
  ],
  providers: [CustomerModuleResolver, CustomerModuleService],
  exports: [CustomerModuleService],
})
export class CustomerModuleModule {}
