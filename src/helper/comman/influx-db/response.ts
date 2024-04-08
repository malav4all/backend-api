import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TrackPlayResponse {
  @Field(() => String)
  stopTime: string;

  @Field(() => String)
  currentTime: string;

  @Field(() => String)
  measurement: string;

  @Field(() => String)
  label: string;

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

  @Field(() => Float, { nullable: true })
  lat: number;

  @Field(() => Float, { nullable: true })
  lng: number;

  @Field(() => String, { nullable: true })
  mode: string;

  @Field(() => String, { nullable: true })
  source: string;
}
