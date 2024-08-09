import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { Document } from 'mongoose';
import GraphQLJSON from 'graphql-type-json';

@Schema({ timestamps: true })
@ObjectType()
@Entity()
export class TripType {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Field()
  @Prop({ text: true })
  @Column()
  accountId: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  tripName: string;

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

  @Column()
  @Field(() => GraphQLJSON, { nullable: true })
  disableField: typeof GraphQLJSON;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column()
  filtrationFelid: typeof GraphQLJSON;

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

export const TripTypeSchema = SchemaFactory.createForClass(TripType);
