import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class AccountConfigInput {
  @Field({ nullable: true })
  key: string;
  @Field({ nullable: true })
  value: string;
}

@InputType()
export class CreateAccountInput {
  @Field({ nullable: true })
  accountId?: string;

  @Field({ nullable: true })
  @IsOptional()
  accountLogo?: string;

  @Field()
  accountName?: string;

  @Field()
  industryType: string;

  @Field({ nullable: true })
  @IsOptional()
  accountPanNo?: string;

  @Field({ nullable: true })
  @IsOptional()
  accountGstNo?: string;

  @Field({ nullable: true })
  @IsOptional()
  accountAadharNo?: string;

  @Field()
  @IsOptional()
  accountAddress?: string;

  @Field({ nullable: true })
  @IsOptional()
  accountState?: string;

  @Field({ nullable: true })
  @IsOptional()
  accountCity?: string;

  @Field({ nullable: true })
  @IsOptional()
  parentId?: string;

  @Field()
  @IsOptional()
  accountContactName?: string;

  @Field()
  @IsOptional()
  accountContactEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  accountContactMobile?: string;

  @Field({ nullable: true })
  @IsOptional()
  remarks?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  accountAuthMobile?: string[];

  @Field({ nullable: true })
  @IsOptional()
  accountApiKey?: string;

  @Field(() => [AccountConfigInput], { nullable: true })
  @IsOptional()
  accountConfiguration?: [AccountConfigInput];

  @Field({ nullable: true })
  @IsOptional()
  createdBy: string;

  @Field({ nullable: true })
  @IsOptional()
  updatedBy?: string;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  isDelete: boolean;

  @Field({ nullable: true })
  @IsOptional()
  nodeSequence: number;
}

@InputType()
export class AccountInput {
  @Field(() => Int, { nullable: true })
  page: typeof Int;
  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class SearchAccountInput {
  @Field({ nullable: true })
  search: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}
