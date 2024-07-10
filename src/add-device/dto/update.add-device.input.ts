import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateAddDeviceInput } from './add-device.input';

@InputType()
export class UpdateAddDeviceInput extends PartialType(CreateAddDeviceInput) {
  @Field()
  _id: string;
}
