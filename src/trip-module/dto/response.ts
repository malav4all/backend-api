import { ObjectType, Field } from '@nestjs/graphql';
import { PaginatorInfo } from '@imz/helper';
import { Trip } from '../entity/trip-module.entity';

@ObjectType()
export class TripResponse {
  @Field(() => PaginatorInfo, { nullable: true })
  paginatorInfo: PaginatorInfo;
  @Field({ nullable: true })
  success: number;
  @Field({ nullable: true })
  message: string;
  @Field(() => [Trip])
  data: [Trip];
}

@ObjectType()
export class BatteryResponse {
  @Field({ nullable: true })
  success: boolean;

  @Field({ nullable: true })
  message: string;
}
