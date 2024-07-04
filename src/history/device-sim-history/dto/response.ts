import { ObjectType, Field } from '@nestjs/graphql';
import { PaginatorInfo } from '@imz/helper';
import { DeviceSimHistory } from '../enitites/device-sim-history.entity';

@ObjectType()
export class DeviceSimHistoryResponse {
  @Field(() => PaginatorInfo, { nullable: true })
  paginatorInfo: PaginatorInfo;
  @Field({ nullable: true })
  success: number;
  @Field({ nullable: true })
  message: string;
  @Field(() => [DeviceSimHistory], { nullable: true })
  data: [DeviceSimHistory];
}
