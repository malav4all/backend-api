import { Field, InputType, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateFormBuilderInput {
  @Field(() => Int, { nullable: true })
  formId: number;

  @Field({ nullable: true })
  accountId: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  description: string;

  @Field(() => GraphQLJSON, { nullable: true })
  content: typeof GraphQLJSON;

  @Field({ nullable: true })
  createdBy?: string;

  @Field({ nullable: true })
  updatedBy?: string;
  @Field({ nullable: true })
  published?: boolean;
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
