import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { Document, Types } from 'mongoose';
import { IsOptional } from 'class-validator';
import { DeviceOnboardingAccountResponseType } from '../dto/device-onboarding-account.response';

@Schema({ timestamps: true })
@Entity()
@ObjectType()
export class DeviceOnboardingHistory {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Field({ nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'AccountModule' })
  @Column()
  deviceOnboardingAccount: DeviceOnboardingAccountResponseType;

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
  deviceOnboardingDate: Date;

  @Prop({ text: true })
  @Column()
  @Field({ nullable: true })
  @IsOptional()
  deviceDeboardingDate?: Date;

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

export type DeviceOnboardingHistoryDocument = DeviceOnboardingHistory &
  Document;
export const DeviceOnboardingHistorySchema = SchemaFactory.createForClass(
  DeviceOnboardingHistory
);
