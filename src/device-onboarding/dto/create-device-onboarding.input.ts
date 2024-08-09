import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class DeviceOnboardingInput {
  @Field({ nullable: true })
  accountId: string;

  @Field({ nullable: true })
  @IsOptional()
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  deviceName?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  deviceOnboardingSimNo?: string[];

  @Field({ nullable: true })
  deviceOnboardingIMEINumber: string;

  @Field({ nullable: true })
  businessModel: string;

  @Field({ nullable: true })
  @IsOptional()
  accountTransferBy?: string;

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

  @Field({ nullable: true })
  location: string;
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
export class DeviceTransferInput {
  @Field({ nullable: true })
  fromAccountId: string;

  @Field({ nullable: true })
  imei: string;

  @Field({ nullable: true })
  toAccountId: string;

  @Field({ nullable: true })
  accountTransferBy: string;
}

@InputType()
export class BulkDeviceOnboardingInput {
  @Field({ nullable: true })
  fromAccountId: string;

  @Field(() => [String], { nullable: true })
  imei: string[];

  @Field({ nullable: true })
  toAccountId: string;

  @Field({ nullable: true })
  accountTransferBy: string;
}

@InputType()
export class DeviceOnboardingAccountIdInput {
  @Field({ nullable: true })
  accountId: string;
}

@InputType()
export class GetBatteryPercentageGraphInput {
  @Field({ nullable: true })
  accountId: string;

  @Field({ nullable: true })
  imei: string;
}
