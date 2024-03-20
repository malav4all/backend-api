import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { JourneyResponse } from '../dto/geozone.response';

@Schema({ timestamps: true })
@ObjectType()
@Entity()
export class Journey {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Field()
  @Prop()
  @Column()
  journeyName: string;

  @Field()
  @Prop([{ type: Types.ObjectId, ref: 'Geozone' }])
  @Column()
  journeyData: JourneyResponse;

  @Field()
  @Prop()
  @Column()
  createdBy: string;
}

export type JourneyDocument = Journey & Document;
export const JourneySchema = SchemaFactory.createForClass(Journey);
