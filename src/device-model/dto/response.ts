import { ObjectType, Field } from '@nestjs/graphql';
import { PaginatorInfo } from '@imz/helper';
import { DeviceModel } from '../entities/device-model.entity';

@ObjectType()
export class DeviceModelResponse {
  @Field(() => PaginatorInfo, { nullable: true })
  paginatorInfo: PaginatorInfo;
  @Field({ nullable: true })
  success: number;
  @Field({ nullable: true })
  message: string;
  @Field(() => [DeviceModel], { nullable: true })
  data: [DeviceModel];
}
