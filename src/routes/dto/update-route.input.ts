import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateRouteInput } from './create-route.input';

@InputType()
export class UpdateRouteInput extends PartialType(CreateRouteInput) {
  @Field()
  _id: string;
}
