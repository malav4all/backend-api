import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateIndustryInput } from './create-industry.input';

@InputType()
export class UpdateIndustryInput extends PartialType(CreateIndustryInput) {
  @Field()
  _id: string;
}
