import { InputType, Field, PartialType } from '@nestjs/graphql';
import { DeviceOnboardingHistoryInput } from './create-device-oonboarding-history.input';

@InputType()
export class UpdateDeviceOnboardingHistoryInput extends PartialType(
  DeviceOnboardingHistoryInput
) {
  @Field()
  _id: string;
}
