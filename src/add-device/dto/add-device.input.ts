import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class CreateAddDeviceInput {
  @Field({ nullable: true })
  imei: string;

  @Field({ nullable: true })
  deviceModelCode: string;

  @Field({ nullable: true })
  createdBy: string;

  @Field({ nullable: true })
  @IsOptional()
  updatedBy?: string;
}

@InputType()
export class AddDeviceInput {
  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class SearchAddDeviceInput {
  @Field({ nullable: true })
  search: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}
