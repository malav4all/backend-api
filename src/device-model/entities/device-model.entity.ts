import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, Column, ObjectIdColumn } from 'typeorm';
import { Document, Types } from 'mongoose';
import { IsOptional } from 'class-validator';

@ObjectType()
export class DeviceModelValuesInput {
  @Field({ nullable: true })
  key: string;
  @Field()
  value: string;
}

@ObjectType()
export class DeviceModelCommandInput {
  @Field({ nullable: true })
  key: string;
  @Field()
  value: string;
}

@Schema({ timestamps: true })
@ObjectType()
@Entity()
export class DeviceModel {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Field()
  @Prop()
  @Column()
  deviceId: string;

  @Field()
  @Prop()
  @Column()
  deviceModelName: string;

  @Field()
  @Prop()
  @Column()
  deviceModel: string;

  @Field({ nullable: true })
  @Prop()
  @Column()
  @IsOptional()
  deviceModelType: string;

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

  @Field(() => [DeviceModelCommandInput], { nullable: true })
  @Prop()
  @Column()
  @IsOptional()
  deviceModelCommands?: [DeviceModelCommandInput];

  @Field(() => [DeviceModelValuesInput])
  @Prop()
  @Column()
  deviceModelConfig: [DeviceModelValuesInput];

  @Field()
  @Prop()
  @Column()
  isDelete: boolean;

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

export type DeviceModelDocument = DeviceModel & Document;
export const DeviceModelSchema = SchemaFactory.createForClass(DeviceModel);

// DeviceModelSchema.index({
//   name: 'text',
//   description: 'text',
// });
