import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateLocationTypeInput } from './create-location-type.input';

@InputType()
export class UpdateLocationTypeInput extends PartialType(
  CreateLocationTypeInput
) {
  @Field()
  _id: string;
}
