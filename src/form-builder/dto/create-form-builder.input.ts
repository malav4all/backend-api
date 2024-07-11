import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class FieldInputType {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  label: string;

  @Field(() => Boolean, { nullable: true })
  required: boolean;

  @Field({ nullable: true })
  type: string;
}

@InputType()
export class CreateFormBuilderInput {
  @Field({ nullable: true })
  accountId: string;

  @Field({ nullable: true })
  formTitle: string;

  @Field(() => [FieldInputType], { nullable: true })
  fields: [FieldInputType];

  @Field(() => Boolean, { nullable: true })
  isFormEnable: boolean;

  @Field({ nullable: true })
  createdBy?: string;

  @Field({ nullable: true })
  updatedBy?: string;
}

@InputType()
export class FormBuildInput {
  @Field({ nullable: true })
  accountId: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}
