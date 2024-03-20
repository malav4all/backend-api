import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateJourneyInput } from './create-journey.input';

@InputType()
export class UpdateJourneyInput extends PartialType(CreateJourneyInput) {
  @Field()
  _id: string;
}
