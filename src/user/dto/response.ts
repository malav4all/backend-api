import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../entities/user.entity';
import { PaginatorInfo } from '@imz/helper';

@ObjectType()
export class UserResponse {
  @Field(() => PaginatorInfo, { nullable: true })
  paginatorInfo: PaginatorInfo;
  @Field({ nullable: true })
  success: number;
  @Field({ nullable: true })
  message: string;
  @Field(() => [User])
  data: [User];
}
