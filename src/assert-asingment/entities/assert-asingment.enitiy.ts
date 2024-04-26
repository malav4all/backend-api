import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import mongoose, { Document, Types } from 'mongoose';
import { IsOptional } from 'class-validator';
import { JourneyResponseType } from '../dto/journey-response.type';
import { Column, Index } from 'typeorm';

@Schema({ timestamps: true })
@ObjectType()
export class AssertAssingmentModuleEntity {
  @Field({ nullable: true })
  _id: string;

  @Field()
  @Prop({ type: Number })
  imei: number;

  @Field()
  @Prop({ text: true })
  labelName: string;

  @Field(() => JourneyResponseType, { nullable: true })
  @Prop({ required: false })
  journey?: JourneyResponseType;

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
AssertAssingmentModuleSchema.index({
  imei: 'text',
  labelName: 'text',
  boxSet: 'text',
  createdBy: 'text',
});
