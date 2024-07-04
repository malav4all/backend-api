import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { Document, Types } from 'mongoose';
import { IsOptional } from 'class-validator';
import { DeviceOnboardingAccountModuleResponse } from '../dto/device-onboarding-account.response';
import { DeviceOnboardingUserResponse } from '../dto/device-onboarding-user.response';
import { DeviceOnboardingDeviceModelResponse } from '../dto/device-onboarding.model.response';

@Schema({ timestamps: true })
@Entity()
@ObjectType()
export class DeviceOnboarding {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  @IsOptional()
  assetsType?: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  @IsOptional()
  deviceOnboardingName?: string;

  @Field({ nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'AccountModule' })
  @Column()
  deviceOnboardingAccount: DeviceOnboardingAccountModuleResponse;

  @Field({ nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'User' })
  @Column()
  deviceOnboardingUser: DeviceOnboardingUserResponse;

  @Field(() => [String], { nullable: true })
  @Prop()
  @Column()
  @IsOptional()
  deviceOnboardingSimNo?: string[];

  @Field({ nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'DeviceModel' })
  @Column()
  @IsOptional()
  deviceOnboardingModel?: DeviceOnboardingDeviceModelResponse;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  @IsOptional()
  deviceOnboardingStatus?: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  @IsOptional()
  deviceOnboardingIMEINumber: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  @IsOptional()
  createdBy: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  @IsOptional()
  updatedBy?: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  @IsOptional()
  tenantId?: string;
}

export type DeviceOnboardingDocument = DeviceOnboarding & Document;
export const DeviceOnboardingSchema =
  SchemaFactory.createForClass(DeviceOnboarding);
