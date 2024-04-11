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
  @Field(() => String, { nullable: true })
  event: string;

  @Field(() => String, { nullable: true })
  lat: string;

  @Field(() => String, { nullable: true })
  imei: string;

  @Field(() => String, { nullable: true })
  label: string;

  @Field(() => String, { nullable: true })
  lng: string;

  @Field(() => String, { nullable: true })
  mode: string;

  @Field(() => String, { nullable: true })
  source: string;

  @Field(() => String, { nullable: true })
  message: string;

  @Field(() => String, { nullable: true })
  time: string;
}

@InputType()
export class AlertInputType {
  @Field(() => String)
  startDate: string;

  @Field(() => String)
  endDate: string;
}

@ObjectType()
export class DeviceStatus {
  @Field(() => String)
  time: string;

  @Field(() => String)
  imei: string;

  @Field(() => String)
  label: string;

  @Field(() => String)
  lat: string;

  @Field(() => String)
  lng: string;

  @Field(() => String)
  status: string;
}

@ObjectType()
class CoordinatesTypeResponse {
  @Field(() => String, { nullable: true })
  latitude: string;

  @Field(() => String, { nullable: true })
  longitude: string;

  @Field(() => String, { nullable: true })
  time: string;
}

@ObjectType()
export class DistanceReportResponse {
  @Field(() => String, { nullable: true })
  imei: string;

  @Field(() => [CoordinatesTypeResponse], { nullable: true })
  coordinates: [CoordinatesTypeResponse];
}
