import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

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

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  disableField?: typeof GraphQLJSON;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  filtrationFelid?: typeof GraphQLJSON;

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
