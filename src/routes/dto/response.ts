import { ObjectType, Field } from '@nestjs/graphql';
import { PaginatorInfo } from '@imz/helper';
import { Route } from '../entity/route.entity';

@ObjectType()
export class RouteResponseData {
  @Field(() => PaginatorInfo, { nullable: true })
  paginatorInfo: PaginatorInfo;
  @Field({ nullable: true })
  success: number;
  @Field({ nullable: true })
  message: string;
  @Field(() => [Route])
  data: [Route];
}
