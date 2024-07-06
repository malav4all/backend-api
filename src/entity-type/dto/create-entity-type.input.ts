import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateEntityTypeInput {
  @Field(() => String)
  accountId: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  createdBy: string;
}

@InputType()
export class EntityTypeInput {
  @Field(() => String)
  accountId: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class SearchEntityInput {
  @Field(() => String)
  accountId: string;

  @Field({ nullable: true })
  search: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}
