import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateAccountInput } from './create-account-module.input';

@InputType()
export class UpdateAccountInput extends PartialType(CreateAccountInput) {
  @Field()
  _id: string;
}
