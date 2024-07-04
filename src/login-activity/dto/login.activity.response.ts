import { PaginatorInfo } from '@imz/helper';
import { ObjectType, Field } from '@nestjs/graphql';
import { LoginActivity } from '../entity/login-activity.entity';

@ObjectType()
export class LoginActivityResponse {
  @Field(() => PaginatorInfo, { nullable: true })
  paginatorInfo: PaginatorInfo;
  @Field({ nullable: true })
  success: number;
  @Field({ nullable: true })
  message: string;
  @Field(() => [LoginActivity])
  data: [LoginActivity];
}
