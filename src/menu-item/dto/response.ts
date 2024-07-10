import { ObjectType, Field } from '@nestjs/graphql';
import { PaginatorInfo } from '@imz/helper';
import { MenuItem } from '../entities/menu-item.entity';

@ObjectType()
export class MenuItemResponse {
  @Field(() => PaginatorInfo, { nullable: true })
  paginatorInfo: PaginatorInfo;

  @Field({ nullable: true })
  success: number;

  @Field({ nullable: true })
  message: string;

  @Field(() => [MenuItem])
  data: MenuItem[];
}
