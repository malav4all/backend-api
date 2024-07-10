import { ObjectType, Field } from '@nestjs/graphql';
import { PaginatorInfo } from '@imz/helper';
import { AddDevice } from '../entity/add-device.entity';

@ObjectType()
export class AddDeviceResponse {
  @Field(() => PaginatorInfo, { nullable: true })
  paginatorInfo: PaginatorInfo;
  @Field({ nullable: true })
  success: number;
  @Field({ nullable: true })
  message: string;
  @Field(() => [AddDevice])
  data: [AddDevice];
}
