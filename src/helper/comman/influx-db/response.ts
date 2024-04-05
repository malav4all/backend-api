import { Field, ObjectType } from '@nestjs/graphql';

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
  lat: string;

  @Field(() => String)
  lng: string;
}
