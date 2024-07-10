import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TripType, TripTypeSchema } from './entites/trip-type.entity';
import { TripTypeService } from './trip.service';
import { TripTypeResolver } from './trip-type.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TripType.name, schema: TripTypeSchema },
    ]),
  ],
  providers: [TripTypeResolver, TripTypeService],
  exports: [TripTypeService],
})
export class TripTypeModule {}
