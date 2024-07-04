import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateTransitTypeInput } from './create-transit-type.input';

@InputType()
export class UpdateTransitTypeInput extends PartialType(
  CreateTransitTypeInput
) {
  @Field()
  _id: string;
}
