import { Field, InputType, Int, ID } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { ObjectID, ObjectIdColumn } from 'typeorm';

@InputType()
export class CreateDeviceGroupInput {
  @Field(() => String, { nullable: true })
  deviceGroupName: string;

  @Field(() => [ID], { nullable: true })
  imeiData: string[];

  @Field(() => ID, { nullable: true })
  tenantId: string;

  @Field(() => ID, { nullable: true })
  accountId: string;

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

  @Field({ nullable: true })
  tenantId: string;

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
  tenantId: string;

  @Field({ nullable: true })
  search: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}
