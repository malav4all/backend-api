import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
class DashboardType {
  @Field(() => Float)
  totalUser: number;

  @Field(() => Float)
  totalJourney: number;

  @Field(() => Float)
  ongoingJourney: number;
}

@ObjectType()
export class DashboardResponse {
  @Field(() => DashboardType)
  data: DashboardType;
}
