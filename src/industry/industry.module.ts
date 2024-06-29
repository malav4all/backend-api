import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Industry, IndustrySchema } from './entities/industry.entity';
import { IndustryResolver } from './industry.resolver';
import { IndustryService } from './industry.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Industry.name, schema: IndustrySchema },
    ]),
  ],
  providers: [IndustryResolver, IndustryService],
  exports: [IndustryService],
})
export class IndustryModule {}
