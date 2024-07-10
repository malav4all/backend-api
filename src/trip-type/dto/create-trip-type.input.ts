import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateTripTypeInput {
  @Field({ nullable: true })
  tripName: string;

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
export class TripTypeInput {
  @Field(() => Int, { nullable: true })
  page: typeof Int;
  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class SearchTripTypeInput {
  @Field({ nullable: true })
  search: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}
