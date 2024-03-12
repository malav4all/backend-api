import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { Document, Types } from 'mongoose';
import { IsOptional } from 'class-validator';
import { GeozoneResponse } from '../dto/geozone';

@Schema({ timestamps: true })
@Entity()
@ObjectType()
export class AssertAssingmentModuleEntity {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Field()
  @Prop({ text: true })
  @Column()
  imei: number;

  @Field()
  @Prop({ text: true })
  @Column()
  labelName: string;

  @Field()
  @Prop({ type: Types.ObjectId, ref: 'Geozone' })
  journey: GeozoneResponse;

  @Field()
  @Prop({ text: true })
  @Column()
  boxSet: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  @IsOptional()
  createdBy?: string;

  @Field({ nullable: true })
  @Prop()
  @Column()
  @IsOptional()
  updatedBy?: string;
}

export type AssertAssingmentModuleDocument = AssertAssingmentModuleEntity &
  Document;
export const AssertAssingmentModuleSchema = SchemaFactory.createForClass(
  AssertAssingmentModuleEntity
);
AssertAssingmentModuleSchema.index({ accountName: 'text' });
