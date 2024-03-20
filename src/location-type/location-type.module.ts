import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationTypeResolver } from './location-type.reslover';
import { LocationTypeService } from './location-type.service';
import {
  LocationType,
  LocationTypeSchema,
} from './entity/location-type.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LocationType.name, schema: LocationTypeSchema },
    ]),
  ],
  providers: [LocationTypeResolver, LocationTypeService],
  exports: [LocationTypeService],
})
export class LocationTypeModule {}
