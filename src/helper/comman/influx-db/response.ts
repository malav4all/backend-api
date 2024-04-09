import { Field, Float, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TrackPlayResponse {
  @Field(() => String)
  stopTime: string;

  @Field(() => String)
  currentTime: string;

  @Field(() => String)
  startTime: string;

  @Field(() => String)
  measurement: string;

  @Field(() => String)
  label: string;

  @Field(() => String)
  imei: string;

  @Field(() => String)
  direction: string;

  @Field(() => String)
  lat: string;

  @Field(() => String)
  lng: string;
}

@ObjectType()
export class AlertResponseTableData {
  @Field(() => String)
  event: string;

  @Field(() => String)
  lat: string;

  @Field(() => String)
  imei: string;

  @Field(() => String)
  label: string;

  @Field(() => String)
  lng: string;

  @Field(() => String)
  mode: string;

  @Field(() => String)
  source: string;
}

@InputType()
export class AlertInputType {
  @Field(() => String)
  startDate: string;

  @Field(() => String)
  endDate: string;
}
