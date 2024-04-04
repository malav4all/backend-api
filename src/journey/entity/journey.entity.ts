import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, now } from 'mongoose';
import { JourneyResponse } from '../dto/geozone.response';
import { Column } from 'typeorm';

@Schema({ timestamps: true })
@ObjectType()
export class Journey {
  @Field()
  _id: string;

  @Field()
  @Prop({ text: true })
  journeyName: string;

  @Field(() => [JourneyResponse])
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Geozone' }] })
  journeyData: JourneyResponse[];

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

  @Field()
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
});
