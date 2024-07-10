import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateRouteInput {
  @Field({ nullable: true })
  accountId: string;

  @Field(() => String, { nullable: true })
  routeName: string;

  @Field(() => [String], { nullable: true })
  routeData: string[];

  @Field({ nullable: true })
  createdBy: string;

  @Field({ nullable: true })
  totalDistance: number;

  @Field({ nullable: true })
  totalDuration: number;
}

@InputType()
export class RouteInput {
  @Field({ nullable: true })
  accountId: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class SearchRouteInput {
  @Field({ nullable: true })
  accountId: string;

  @Field(() => String)
  search: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}
