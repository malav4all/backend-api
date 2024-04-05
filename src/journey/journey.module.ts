import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JourneyResolver } from './journey.resolver';
import { JourneyService } from './journey.service';
import { Journey, JourneySchema } from './entity/journey.entity';
import {
  AssertAssingmentModuleEntity,
  AssertAssingmentModuleSchema,
} from '@imz/assert-asingment/entities/assert-asingment.enitiy';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Journey.name, schema: JourneySchema },
      {
        name: AssertAssingmentModuleEntity.name,
        schema: AssertAssingmentModuleSchema,
      },
    ]),
  ],
  providers: [JourneyResolver, JourneyService],
  exports: [JourneyService],
})
export class JourneyModule {}
