import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateEntitesInput } from './create-entites.input';

@InputType()
export class UpdateEntitesInput extends PartialType(CreateEntitesInput) {
  @Field()
  _id: string;
}
