import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateTripTypeInput } from './create-trip-type.input';

@InputType()
export class UpdateTripTypeInput extends PartialType(CreateTripTypeInput) {
  @Field()
  _id: string;
}
