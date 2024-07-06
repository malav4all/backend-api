import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateEntityTypeInput } from './create-entity-type.input';

@InputType()
export class UpdateEntityTypeInput extends PartialType(CreateEntityTypeInput) {
  @Field()
  _id: string;
}
