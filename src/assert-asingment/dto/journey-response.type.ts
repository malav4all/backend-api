import { Prop } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { GeozoneAsset } from './geozone.-response.type';

@ObjectType()
export class JourneyResponseType {
  @Field()
  _id: string;

  @Field()
  @Prop()
  journeyName: string;

  @Field(() => [GeozoneAsset])
  @Prop()
  journeyData: GeozoneAsset[];

  @Field()
  @Prop()
  createdBy: string;

  @Field(() => Date)
  @Prop()
  startDate: Date;

  @Field(() => Date)
  @Prop()
  endDate: Date;

  @Field()
  @Prop()
  totalDistance: number;

  @Field()
  @Prop()
  totalDuration: number;
}
