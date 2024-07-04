import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransitType, TransitTypeSchema } from './entites/transit-type.entity';
import { TransitTypeService } from './transit.service';
import { TransitTypeResolver } from './tansit-type.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TransitType.name, schema: TransitTypeSchema },
    ]),
  ],
  providers: [TransitTypeResolver, TransitTypeService],
  exports: [TransitTypeService],
})
export class TransitTypeModule {}
