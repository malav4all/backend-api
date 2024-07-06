import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateUserAccessInput } from './create-user-access.input';

@InputType()
export class UpdateUserAccessInput extends PartialType(CreateUserAccessInput) {
  @Field()
  _id: string;
}
