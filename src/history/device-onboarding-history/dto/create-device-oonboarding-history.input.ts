import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class DeviceOnboardingHistoryInput {
  @Field({ nullable: true })
  deviceOnboardingAccount: string;

  @Field(() => [String])
  deviceOnboardingSimNo: string[];

  @Field({ nullable: true })
  deviceOnboardingIMEINumber: number;

  @Field({ nullable: true, defaultValue: new Date().toISOString() })
  deviceOnboardingDate: Date;

  @Field({ nullable: true })
  @IsOptional()
  deviceDeboardingDate?: Date;

  @Field({ nullable: true })
  createdBy: string;

  @Field({ nullable: true })
  @IsOptional()
  updatedBy?: string;
}

@InputType()
export class DeviceOnboardingHistoryFetchInput {
  @Field(() => Int, { nullable: true })
  page: typeof Int;
  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}
