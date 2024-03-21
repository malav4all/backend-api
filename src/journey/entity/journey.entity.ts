import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { JourneyResponse } from '../dto/geozone.response';

@Schema({ timestamps: true })
@ObjectType()
export class Journey {
  @Field()
  _id: string;

  @Field()
  @Prop()
  journeyName: string;

  @Field(() => [JourneyResponse])
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Geozone' }] })
  journeyData: JourneyResponse[];

  @Field()
  @Prop()
  createdBy: string;
}

export type JourneyDocument = Journey & Document;
export const JourneySchema = SchemaFactory.createForClass(Journey);
