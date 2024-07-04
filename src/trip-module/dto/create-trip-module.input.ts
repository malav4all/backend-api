import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class TripInformationDetail {
  @Field(() => [String], { nullable: true })
  imei: string[];

  @Field({ nullable: true })
  vehicleNo: string;

  @Field({ nullable: true })
  tripDate: string;

  @Field({ nullable: true })
  remarks: string;
}

@InputType()
export class CreateTripInput {
  @Field({ nullable: true })
  tripId: string;

  @Field({ nullable: true })
  status: string;

  @Field({ nullable: true })
  primaryAccount: string;

  @Field(() => [String], { nullable: true })
  accessAccount: string[];

  @Field({ nullable: true })
  tripStartDate: string;

  @Field({ nullable: true })
  tripEndDate: string;

  @Field(() => [TripInformationDetail], { nullable: true })
  tripData: [TripInformationDetail];

  @Field(() => GraphQLJSON, { nullable: true })
  journey: typeof GraphQLJSON;

  @Field(() => GraphQLJSON, { nullable: true })
  alertConfig: typeof GraphQLJSON;

  @Field(() => GraphQLJSON, { nullable: true })
  startPoint: typeof GraphQLJSON;

  @Field(() => GraphQLJSON, { nullable: true })
  endPoint: typeof GraphQLJSON;

  @Field(() => GraphQLJSON, { nullable: true })
  metaData: typeof GraphQLJSON;

  @Field({ nullable: true })
  @IsOptional()
  createdBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  updatedBy?: string;
}

@InputType()
export class TripInput {
  @Field(() => Int, { nullable: true })
  page: typeof Int;
  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class SearchTripInput {
  @Field({ nullable: true })
  search: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}
