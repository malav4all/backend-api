import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, Column, ObjectIdColumn } from 'typeorm';
import { Document, Types } from 'mongoose';
import { IsOptional } from 'class-validator';

@ObjectType()
export class DeviceModelValuesInputResponse {
  @Field({ nullable: true })
  key: string;
  @Field()
  value: string;
}

@Schema({ timestamps: true })
@ObjectType()
@Entity()
export class DeviceOnboardingDeviceModelResponse {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Field()
  @Prop()
  @Column()
  deviceModelName: string;

  @Field()
  @Prop()
  @Column()
  deviceModel: string;

  @Field(() => [String], { nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'DeviceType' })
  @Column()
  @IsOptional()
  deviceModelType?: string[];

  @Field()
  @Prop()
  @Column()
  deviceModelIpAddress: string;

  @Field()
  @Prop()
  @Column()
  deviceModelPortNumber: number;

  @Field()
  @Prop()
  @Column()
  deviceModelSimCount: number;

  @Field()
  @Prop()
  @Column()
  deviceModelNetworkType: string;

  @Field()
  @Prop()
  @Column()
  deviceModelParser: string;

  @Field(() => [String], { nullable: true })
  @Prop()
  @Column()
  @IsOptional()
  deviceModelComands?: string[];

  @Field(() => [DeviceModelValuesInputResponse])
  @Prop()
  @Column()
  deviceModelConfig: [DeviceModelValuesInputResponse];

  @Field({ nullable: true })
  @Prop()
  @Column()
  @IsOptional()
  createdBy?: string;

  @Field({ nullable: true })
  @Prop()
  @Column()
  @IsOptional()
  updatedBy?: string;
}
