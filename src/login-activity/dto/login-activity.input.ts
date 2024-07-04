import GraphQLJSON from 'graphql-type-json';
import { LoginActivity } from './../entity/login-activity.entity';
import { Field, InputType, ObjectType, Int, Float } from '@nestjs/graphql';

@InputType()
export class LoginActivityInput {
  @Field({ nullable: true })
  loginTime: Date;

  @Field({ nullable: true })
  logoutTime: Date;

  @Field(() => GraphQLJSON, { nullable: true })
  user: typeof GraphQLJSON;

  @Field(() => GraphQLJSON, { nullable: true })
  systemInfo: typeof GraphQLJSON;
}

@InputType()
export class LogoutInput {
  @Field({ nullable: true })
  _id: string;
}

@InputType()
export class UpdateActivityInput {
  @Field({ nullable: true })
  _id: string;

  @Field({ nullable: true })
  userId: string;

  @Field({ nullable: true })
  ipAddress: string;

  @Field({ nullable: true })
  browserInfo: string;

  @Field({ nullable: true })
  loginTime: Date;

  @Field({ nullable: true })
  logoutTime: Date;
}

@InputType()
export class LoginActivityFetchInput {
  @Field(() => Int, { nullable: true })
  page: typeof Int;
  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class SearchLoginActivityInput {
  @Field({ nullable: true })
  search: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}
