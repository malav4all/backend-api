import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateAssertAssingmentModuleInput } from './create-assert-asingment.input';

@InputType()
export class UpdateAssertAssingmentModuleInput extends PartialType(
  CreateAssertAssingmentModuleInput
) {
  @Field()
  _id: string;
}
