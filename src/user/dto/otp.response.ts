import { ObjectType, Field, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class OtpResponse {
  @Field({ nullable: true })
  success: number;

  @Field({ nullable: true })
  message: string;

  @Field({ nullable: true })
  email: string;
}

@ObjectType()
export class OtpLoginResponse {
  @Field({ nullable: true })
  success: number;

  @Field({ nullable: true })
  message: string;

  @Field(() => GraphQLJSON, { nullable: true })
  data: typeof GraphQLJSON;
}
