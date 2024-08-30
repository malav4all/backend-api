import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateLocationTypeInput {
  @Field({ nullable: true })
  accountId: string;

  @Field(() => String)
  type: string;

  @Field(() => String)
  createdBy: string;

  @Field(() => String, { nullable: true })
  updatedBy?: string;
}

@InputType()
export class LocationTypeInput {
  @Field({ nullable: true })
  accountId: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class SearchLocationsInput {
  @Field({ nullable: true })
  accountId: string;

  @Field({ nullable: true })
  search: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}
