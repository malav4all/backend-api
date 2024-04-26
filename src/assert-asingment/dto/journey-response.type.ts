import { Prop } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { GeozoneAsset } from './geozone-response.type';
import { Index } from 'typeorm';

@ObjectType()
export class JourneyResponseType {
  @Field({ nullable: true })
  _id: string;

  @Field({ nullable: true })
  @Prop()
  @Index({ unique: true })
  journeyName: string;

  @Field(() => [GeozoneAsset], { nullable: true })
  @Prop()
  journeyData: GeozoneAsset[];

  @Field({ nullable: true })
  @Prop()
  createdBy: string;

  @Field(() => Date, { nullable: true })
  @Prop()
  startDate: Date;

  @Field(() => Date, { nullable: true })
  @Prop()
  endDate: Date;

  @Field({ nullable: true })
  @Prop()
  totalDistance: number;

  @Field({ nullable: true })
  @Prop()
  totalDuration: number;
}
