import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class CreateUserAccessInput {
  @Field({ nullable: true })
  accountId: string;

  @Field({ nullable: true })
  userId: string;

  @Field(() => [String], { nullable: true })
  deviceGroup: string[];

  @Field(() => [String], { nullable: true })
  entites: string[];

  @Field(() => [String], { nullable: true })
  devicesImei: string[];

  @Field({ nullable: true })
  @IsOptional()
  createdBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  updatedBy?: string;
}

@InputType()
export class UserAccessInput {
  @Field({ nullable: true })
  accountId: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class SearchUserAccessInput {
  @Field({ nullable: true })
  accountId: string;

  @Field({ nullable: true })
  search: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}
