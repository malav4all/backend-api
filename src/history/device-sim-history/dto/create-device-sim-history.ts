import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class DeviceSimHistoryInput {
  @Field(() => [String])
  deviceOnboardingSimNo: string[];

  @Field({ nullable: true })
  deviceOnboardingIMEINumber: number;

  @Field({ nullable: true, defaultValue: new Date().toISOString() })
  fromDate: Date;

  @Field({ nullable: true })
  @IsOptional()
  toDate?: Date;

  @Field({ nullable: true })
  createdBy: string;

  @Field({ nullable: true })
  @IsOptional()
  updatedBy?: string;
}

@InputType()
export class DeviceSimHistoryFetchInput {
  @Field(() => Int, { nullable: true })
  page: typeof Int;
  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}
