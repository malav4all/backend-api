import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, now } from 'mongoose';
import { JourneyResponse } from '../dto/geozone.response';
import { Column } from 'typeorm';

@Schema({ timestamps: true })
@ObjectType()
export class Journey {
  @Field({ nullable: true })
  _id: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  journeyName: string;

  @Field(() => [JourneyResponse], { nullable: true })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Geozone' }] })
  journeyData: JourneyResponse[];

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

  @Field({ nullable: true })
  @Prop()
  imei: number;

  @Field({ nullable: true })
  @Prop({ default: now() })
  @Column()
  createdAt: Date;

  @Field({ nullable: true })
  @Prop({ default: now() })
  @Column()
  updatedAt: Date;
}

export type JourneyDocument = Journey & Document;
export const JourneySchema = SchemaFactory.createForClass(Journey);
JourneySchema.index({
  journeyName: 'text',
  createdBy: 'text',
  imei: 'text',
});
