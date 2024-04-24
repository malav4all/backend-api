import { PaginatorInfo } from '@imz/helper';
import { Field, ObjectType } from '@nestjs/graphql';
import { DeviceGroup } from '../entities/device-group.entity';

@ObjectType()
export class DeviceGroupResponse {
  @Field(() => PaginatorInfo, { nullable: true })
  paginatorInfo: PaginatorInfo;
  @Field({ nullable: true })
  success: number;
  @Field({ nullable: true })
  message: string;
  @Field(() => [DeviceGroup], { nullable: true })
  data: [DeviceGroup];
}
