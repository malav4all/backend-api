import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateJourneyInput {
  @Field(() => String, { nullable: true })
  journeyName: string;

  @Field(() => [String], { nullable: true })
  journeyData: string[];

  @Field({ nullable: true })
  createdBy: string;

  @Field(() => Date)
  startDate: Date;

  @Field(() => Date)
  endDate: Date;
  @Field({ nullable: true })
  totalDistance: number;
  @Field({ nullable: true })
  totalDuration: number;
}

@InputType()
export class JourneyInput {
  @Field(() => Int, { nullable: true })
  page: typeof Int;
  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}
