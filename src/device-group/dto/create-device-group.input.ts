import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { ObjectID, ObjectIdColumn } from 'typeorm';

@InputType()
export class CreateDeviceGroupInput {
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
  @Field(() => Int, { nullable: true })
  page: typeof Int;
  @Field(() => Int, { nullable: true })
  limit: typeof Int;

  @ObjectIdColumn()
  @Field(() => ObjectID, { nullable: true })
  _id: ObjectID;
}

@InputType()
export class SearchDeviceGroupInput {
  @Field({ nullable: true })
  search: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}
