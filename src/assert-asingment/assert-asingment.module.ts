import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AssertAssingmentModuleEntity,
  AssertAssingmentModuleSchema,
} from './entities/assert-asingment.enitiy';
import { AssertAssingmentModuleService } from './assert-asingment.service';
import { AssertAssingmentResolver } from './assert-asingment.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AssertAssingmentModuleEntity.name,
        schema: AssertAssingmentModuleSchema,
      },
    ]),
  ],
  providers: [AssertAssingmentResolver, AssertAssingmentModuleService],
  exports: [AssertAssingmentModuleService],
})
export class AssertAssingmentModuleModule {}
