import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
class AlertConfig {
  @Field(() => String, { nullable: true })
  event: string;

  @Field(() => GraphQLJSON, { nullable: true })
  location: typeof GraphQLJSON;

  @IsOptional()
  @Field({ nullable: true, defaultValue: false })
  isAlreadyGenerateAlert?: boolean;

  @IsOptional()
  @Field(() => String, { nullable: true })
  startDate?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  endDate?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  startAlertTime?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  endAlertTime?: string;
}

@InputType()
class AlertImei {
  @Field(() => String, { nullable: true })
  deviceGroupName: string;

  @Field(() => String, { nullable: true })
  deviceGroupId: string;

  @Field(() => [String], { nullable: true })
  imei: string[];
}

@InputType()
class AlertConfigData {
  @Field(() => AlertImei, { nullable: true })
  alertImeiGroup: AlertImei;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  userSelectedImei?: string[];

  @Field(() => [AlertConfig], { nullable: true })
  alertData: [AlertConfig];
}

@InputType()
export class CreateAlertInputType {
  @Field({ nullable: true })
  accountId: string;

  @Field(() => String, { nullable: true })
  alertName: string;

  @Field(() => String, { nullable: true })
  mobileNo: string;

  @Field(() => AlertConfigData, { nullable: true })
  alertConfig: AlertConfigData;

  @IsOptional()
  @Field({ nullable: true, defaultValue: false })
  isAllSystemAlert?: boolean;

  @IsOptional()
  @Field({ nullable: true, defaultValue: true })
  isAlertDisable?: boolean;

  @Field(() => String, { nullable: true })
  createdBy: string;
}

@InputType()
export class AlertInput {
  @Field({ nullable: true })
  accountId: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class SearchAlertInput {
  @Field({ nullable: true })
  accountId: string;

  @Field({ nullable: true })
  search: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}
