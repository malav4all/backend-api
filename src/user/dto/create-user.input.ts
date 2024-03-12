import { Field, InputType, Int } from '@nestjs/graphql';

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
  roleId: string;

  @Field({ nullable: true, defaultValue: 'Active' })
  status: string;

  @Field({ nullable: true })
  createdBy: string;
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
