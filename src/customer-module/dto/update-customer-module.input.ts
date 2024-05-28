import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateCustomerModuleInput } from './create-customer-module.input';

@InputType()
export class UpdateCustomerModuleInput extends PartialType(
  CreateCustomerModuleInput
) {
  @Field()
  _id: string;
}
