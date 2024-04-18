import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateAlertInputType } from './create-alert.input';

@InputType()
export class UpdateAlertInput extends PartialType(CreateAlertInputType) {
  @Field()
  _id: string;
}
