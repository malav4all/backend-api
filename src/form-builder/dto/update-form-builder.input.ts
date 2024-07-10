import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateFormBuilderInput } from './create-form-builder.input';

@InputType()
export class UpdateFormBuilderInput extends PartialType(
  CreateFormBuilderInput
) {
  @Field()
  _id: string;
}
