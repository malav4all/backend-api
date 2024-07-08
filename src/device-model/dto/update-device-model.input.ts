import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateDeviceModelInput } from './create-device-model.input';

@InputType()
export class UpdateDeviceModelInput extends PartialType(
  CreateDeviceModelInput
) {
  @Field()
  _id: string;
}
