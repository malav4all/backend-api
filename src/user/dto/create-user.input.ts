import { Field, InputType, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
@InputType()
export class CreateUserInput {
  @Field({ nullable: true })
  firstName: string;

  @Field({ nullable: true })
  lastName: string;

  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  mobileNumber: string;

  @Field({ nullable: true })
  userName: string;

  @Field({ nullable: true })
  password: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true, defaultValue: false })
  active?: boolean;

  @Field({ nullable: true, defaultValue: true })
  emailVerified?: boolean;

  @Field({ nullable: true, defaultValue: false })
  isAccountAdmin?: boolean;

  @Field({ nullable: true, defaultValue: false })
  isSuperAdmin?: boolean;

  @Field({ nullable: true, defaultValue: true })
  mobileVerified?: boolean;

  @Field({ nullable: true })
  accountId: string;

  @Field(() => GraphQLJSON, { nullable: true })
  deviceGroup: typeof GraphQLJSON;

  @Field(() => [String], { nullable: true })
  imeiList: string[];

  @Field({ nullable: true })
  roleId: string;

  @Field({ nullable: true })
  parentUserId: string;

  @Field({ nullable: true })
  industryType: string;

  @Field({ nullable: true })
  mainParentId: string;

  @Field({ nullable: true, defaultValue: 'Active' })
  status: string;

  @Field({ nullable: true })
  createdBy: string;

  @Field({ nullable: true })
  roleName: string;

  @Field({ nullable: true })
  accountName: string;
}

@InputType()
export class LoginUserInput {
  @Field({ nullable: true })
  password: string;

  @Field({ nullable: true })
  email: string;
}

@InputType()
export class ChangePasswordInput {
  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  password: string;
}

@InputType()
export class UserInput {
  @Field(() => Int, { nullable: true })
  page: typeof Int;
  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class SearchUsersInput {
  @Field({ nullable: true })
  search: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class OtpInput {
  @Field({ nullable: true })
  mobileNumber: number;
}

@InputType()
export class AccountIdInput {
  @Field({ nullable: true })
  accountId: string;
}

@InputType()
export class VerifyOtpInput {
  @Field()
  mobileNumber: number;

  @Field({ nullable: true })
  otp: string;
}
