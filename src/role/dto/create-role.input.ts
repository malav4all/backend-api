// import { GraphQLJSON } from 'graphql-type-json';
import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class ValuesInput {
  @Field({ nullable: true })
  name: string;
  @Field(() => [String], { nullable: true })
  permissions: string[];
}

@InputType()
export class CreateRoleInput {
  @Field({ nullable: true })
  name: string;
  @Field({ nullable: true })
  description: string;
  @IsOptional()
  @Field({ nullable: true })
  industryType: string;
  @IsOptional()
  @Field(() => Boolean, { nullable: true, defaultValue: false })
  isDelete: boolean;
  @Field(() => [ValuesInput], { nullable: true })
  resources: [ValuesInput];
}

@InputType()
export class RoleInput {
  @Field(() => Int, { nullable: true })
  page: typeof Int;
  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class SearchRolesInput {
  @Field({ nullable: true })
  search: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class checkRoleInput {
  @Field({ nullable: true })
  name: string;
}
