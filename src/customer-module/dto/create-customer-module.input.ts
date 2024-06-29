import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateCustomerModuleInput {
  @Field({ nullable: true })
  name: string;
  @Field({ nullable: true })
  code: string;
  @Field({ nullable: true })
  description: string;
}

@InputType()
export class CustomerModuleInput {
  @Field(() => Int, { nullable: true })
  page: typeof Int;
  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class SearchInput {
  @Field({ nullable: true })
  search: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class CustomerModuleExitsInput {
  @Field({ nullable: true })
  code: string;
  @Field({ nullable: true })
  name: string;
}
