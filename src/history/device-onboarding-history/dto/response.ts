import { ObjectType, Field } from '@nestjs/graphql';
import { PaginatorInfo } from '@imz/helper';
import { DeviceOnboardingHistory } from '../enities/device-onboarding-history.enities';

@ObjectType()
export class DeviceOnboardingHistoryResponse {
  @Field(() => PaginatorInfo, { nullable: true })
  paginatorInfo: PaginatorInfo;
  @Field({ nullable: true })
  success: number;
  @Field({ nullable: true })
  message: string;
  @Field(() => [DeviceOnboardingHistory], { nullable: true })
  data: [DeviceOnboardingHistory];
}
