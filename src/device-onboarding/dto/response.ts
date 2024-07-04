import { ObjectType, Field } from '@nestjs/graphql';
import { PaginatorInfo } from '@imz/helper';
import { DeviceOnboarding } from '../enities/device-onboarding.enities';

@ObjectType()
export class DeviceOnboardingResponse {
  @Field(() => PaginatorInfo, { nullable: true })
  paginatorInfo: PaginatorInfo;
  @Field({ nullable: true })
  success: number;
  @Field({ nullable: true })
  message: string;
  @Field(() => [DeviceOnboarding], { nullable: true })
  data: [DeviceOnboarding];
}
