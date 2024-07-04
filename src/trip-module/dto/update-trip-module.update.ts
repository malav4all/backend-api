import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateTripInput } from './create-trip-module.input';

@InputType()
export class UpdateTripInput extends PartialType(CreateTripInput) {
  @Field()
  _id: string;
}
