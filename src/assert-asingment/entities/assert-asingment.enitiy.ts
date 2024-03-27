import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Document, Types } from 'mongoose';
import { IsOptional } from 'class-validator';
import { JourneyResponseType } from '../dto/journey-response.type';
import { Column, Index } from 'typeorm';

@Schema({ timestamps: true })
@ObjectType()
export class AssertAssingmentModuleEntity {
  @Field()
  _id: string;

  @Field()
  @Prop({ text: true })
  @Index({ unique: true })
  imei: number;

  @Field()
  @Prop({ text: true })
  labelName: string;

  @Field(() => JourneyResponseType)
  @Prop({ type: Types.ObjectId, ref: 'Journey' })
  @Column()
  journey: Types.ObjectId;

  @Field()
  @Prop({ text: true })
  boxSet: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @IsOptional()
  createdBy?: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @IsOptional()
  updatedBy?: string;
}

export type AssertAssingmentModuleDocument = AssertAssingmentModuleEntity &
  Document;
export const AssertAssingmentModuleSchema = SchemaFactory.createForClass(
  AssertAssingmentModuleEntity
);
