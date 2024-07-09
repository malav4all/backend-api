import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class DeviceOnboardingInput {
  @Field({ nullable: true })
  accountId: string;

  @Field({ nullable: true })
  @IsOptional()
  location?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  deviceOnboardingSimNo?: string[];

  @Field({ nullable: true })
  deviceOnboardingIMEINumber: string;

  @Field({ nullable: true })
  businessModel: string;

  @Field({ nullable: true })
  createdBy: string;

  @Field({ nullable: true })
  @IsOptional()
  updatedBy?: string;
}

@InputType()
export class DeviceOnboardingFetchInput {
  @Field({ nullable: true })
  accountId: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class DeviceOnboardingSearchInput {
  @Field({ nullable: true })
  accountId: string;

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
