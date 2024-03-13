import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { Document } from 'mongoose';
import { IsOptional } from 'class-validator';

@Schema({ timestamps: true })
@ObjectType()
@Entity()
export class Geozone {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Field()
  @Prop({ text: true })
  @Column()
  name: string;

  @Field()
  @Prop()
  @Column()
  @IsOptional()
  centerNo?: string;

  @Field()
  @Prop({ text: true })
  @Column()
  type: string;

  @Field()
  @Prop({ text: true })
  @Column()
  @IsOptional()
  mobileNumber: number;

  @Field()
  @Prop()
  @Column()
  address: string;

  @Field()
  @Prop()
  @Column()
  zipCode: string;

  @Field()
  @Prop()
  @Column()
  country: string;

  @Field()
  @Prop()
  @Column()
  state: string;

  @Field()
  @Prop()
  @Column()
  area: string;

  @Field()
  @Prop()
  @Column()
  city: string;

  @Field()
  @Prop()
  @Column()
  district: string;

  @Field()
  @Prop()
  @Column()
  createdBy: string;
}

export type GeozoneDocument = Geozone & Document;
export const GeozoneSchema = SchemaFactory.createForClass(Geozone);
