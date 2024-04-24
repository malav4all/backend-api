import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateDeviceGroupInput } from './create-device-group.input';

@InputType()
export class UpdateDeviceGroupInput extends PartialType(
  CreateDeviceGroupInput
) {
  @Field()
  _id: string;
}
