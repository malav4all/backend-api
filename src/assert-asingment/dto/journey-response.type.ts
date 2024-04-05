import { Prop } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { GeozoneAsset } from './geozone.-response.type';
import { Index } from 'typeorm';

@ObjectType()
export class JourneyResponseType {
  @Field()
  _id: string;

  @Field({ nullable: true })
  @Prop()
  @Index({ unique: true })
  journeyName: string;

  @Field(() => [GeozoneAsset], { nullable: true })
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
