import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateTransitTypeInput {
  @Field({ nullable: true })
  transitName: string;

  @Field({ nullable: true })
  minBatteryPercentage: number;

  @Field({ nullable: true })
  tripRate: number;

  @Field({ nullable: true })
  gstPercentage: string;

  @Field({ nullable: true })
  createdBy: string;

  @Field({ nullable: true })
  updatedBy: string;
}

@InputType()
export class TransitTypeInput {
  @Field(() => Int, { nullable: true })
  page: typeof Int;
  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class SearchTransitTypeInput {
  @Field({ nullable: true })
  search: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}
