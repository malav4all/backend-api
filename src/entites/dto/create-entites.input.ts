import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateEntitesInput {
  @Field(() => String)
  accountId: string;

  @Field(() => [String], { nullable: true })
  tripTypeList: string[];

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => String, { nullable: true })
  type: string;

  @Field(() => String, { nullable: true })
  address: string;

  @Field(() => String, { nullable: true })
  city: string;

  @Field(() => String)
  state: string;

  @Field(() => String)
  area: string;

  @Field(() => String)
  district: string;

  @Field(() => String)
  pinCode: string;

  @Field(() => String)
  contactName: string;

  @Field(() => String)
  contactEmail: string;

  @Field(() => String)
  contactPhone: string;

  @Field(() => String)
  gstIn: string;

  @Field(() => String)
  aadharCardNo: string;

  @Field(() => String)
  createdBy: string;
}

@InputType()
export class EntitesTypeInput {
  @Field(() => String)
  accountId: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class SearchEntitesInput {
  @Field(() => String)
  accountId: string;

  @Field({ nullable: true })
  search: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}
