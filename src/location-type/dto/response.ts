import { ObjectType, Field } from '@nestjs/graphql';
import { PaginatorInfo } from '@imz/helper';
import { LocationType } from '../entity/location-type.entity';

@ObjectType()
export class LocationTypeResponse {
  @Field(() => PaginatorInfo, { nullable: true })
  paginatorInfo: PaginatorInfo;

  @Field({ nullable: true })
  success: number;

  @Field({ nullable: true })
  message: string;

  @Field(() => [LocationType])
  data: [LocationType];
}
