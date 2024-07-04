import { DeviceOnboardingInput } from './create-device-onboarding.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateDeviceOnboardingInput extends PartialType(
  DeviceOnboardingInput
) {
  @Field()
  _id: string;
}
