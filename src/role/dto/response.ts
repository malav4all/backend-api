import { ObjectType, Field } from '@nestjs/graphql';
import { Role } from '../entities/role.entity';
import { PaginatorInfo } from '@imz/helper';

@ObjectType()
export class RoleResponse {
  @Field(() => PaginatorInfo, { nullable: true })
  paginatorInfo: PaginatorInfo;
  @Field({ nullable: true })
  success: number;
  @Field({ nullable: true })
  message: string;
  @Field(() => [Role])
  data: [Role];
}
