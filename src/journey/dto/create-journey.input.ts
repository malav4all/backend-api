import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
class LocationData {
  @Field(() => String)
  locationId: string;
}

@InputType()
export class CreateJourneyInput {
  @Field(() => String, { nullable: true })
  journeyName: string;

  @Field(() => [LocationData], { nullable: true })
  journeyData: [LocationData];

  @Field({ nullable: true })
  createdBy: string;
}

@InputType()
export class JourneyInput {
  @Field(() => Int, { nullable: true })
  page: typeof Int;
  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}
