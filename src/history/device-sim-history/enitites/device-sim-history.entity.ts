import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { Document } from 'mongoose';
import { IsOptional } from 'class-validator';

@Schema({ timestamps: true })
@Entity()
@ObjectType()
export class DeviceSimHistory {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Field(() => [String])
  @Prop({ text: true })
  @Column()
  deviceOnboardingSimNo: string[];

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  deviceOnboardingIMEINumber: number;

  @Prop({ text: true })
  @Column()
  @Field({ nullable: true, defaultValue: new Date().toISOString() })
  fromDate: Date;

  @Prop({ text: true })
  @Column()
  @Field({ nullable: true })
  @IsOptional()
  toDate?: Date;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  createdBy: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  @IsOptional()
  updatedBy?: string;
}

export type DeviceSimHistoryDocument = DeviceSimHistory & Document;
export const DeviceSimHistorySchema =
  SchemaFactory.createForClass(DeviceSimHistory);
