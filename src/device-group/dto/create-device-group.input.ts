import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { ObjectID, ObjectIdColumn } from 'typeorm';

@InputType()
export class CreateDeviceGroupInput {
  @Field({ nullable: true })
  accountId: string;

  @Field(() => String, { nullable: true })
  deviceGroupName: string;

  @Field(() => [String], { nullable: true })
  imeiData: string[];

  @Field({ nullable: true })
  @IsOptional()
  createdBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  updatedBy?: string;
}

@InputType()
export class DeviceGroupInput {
  @Field({ nullable: true })
  accountId: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;

  @Field(() => String, { nullable: true })
  id: string;
}

@InputType()
export class SearchDeviceGroupInput {
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
export class SearchImeiDataInput {
  @Field({ nullable: true })
  accountId: string;

  @Field(() => String, { nullable: true })
  id: string;

  @Field({ nullable: true })
  search: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}
