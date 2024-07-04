import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
@ObjectType()
@Entity()
export class TransitType {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Field()
  @Prop({ text: true })
  @Column()
  transitName: string;

  @Field()
  @Prop({ text: true })
  @Column()
  minBatteryPercentage: number;

  @Field()
  @Prop({ text: true })
  @Column()
  tripRate: number;

  @Field()
  @Prop({ text: true })
  @Column()
  gstPercentage: number;

  @Field()
  @Prop({ text: true })
  @Column()
  createdBy: string;

  @Field()
  @Prop({ text: true })
  @Column()
  updatedBy: string;

  @Field({ nullable: true })
  @Prop()
  @Column()
  lastUpdated: Date;
}

export type TransitTypeDocument = TransitType & Document;
export const TransitTypeSchema = SchemaFactory.createForClass(TransitType);
