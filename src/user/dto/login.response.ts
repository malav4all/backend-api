import { ObjectType, Field } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class LoginResponse {
  @Field(() => GraphQLJSON, { nullable: true })
  data: typeof GraphQLJSON;
}
