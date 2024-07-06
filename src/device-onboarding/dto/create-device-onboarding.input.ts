import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class DeviceOnboardingInput {
  @Field({ nullable: true })
  accountId: string;

  @Field({ nullable: true })
  assetsType: string;

  @IsOptional()
  @Field({ nullable: true })
  description?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  location: typeof GraphQLJSON;

  @Field({ nullable: true })
  deviceOnboardingName: string;

  @Field({ nullable: true })
  deviceOnboardingAccount: string;

  @Field({ nullable: true })
  deviceOnboardingUser: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  deviceOnboardingSimNo?: string[];

  @Field({ nullable: true })
  deviceOnboardingModel: string;

  @Field({ nullable: true, defaultValue: 'Active' })
  deviceOnboardingStatus: string;

  @Field({ nullable: true })
  deviceOnboardingIMEINumber: string;

  @Field({ nullable: true })
  createdBy: string;

  @Field({ nullable: true })
  @IsOptional()
  updatedBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  tenantId?: string;
}

@InputType()
export class DeviceOnboardingFetchInput {
  @Field(() => Int, { nullable: true })
  page: typeof Int;
  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class DeviceOnboardingSearchInput {
  @Field({ nullable: true })
  search: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class DeviceOnboardingAccountIdInput {
  @Field({ nullable: true })
  accountId: string;
}
