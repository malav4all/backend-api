import { AssertAssingmentModuleEntity } from '@imz/assert-asingment/entities/assert-asingment.enitiy';
import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional } from 'class-validator';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
@ObjectType()
export class DeviceGroup {
  @Field({ nullable: true })
  _id: string;

  @Field()
  @Prop({ text: true })
  accountId: string;

  @Field()
  @Prop({ text: true })
  deviceGroupName: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @IsOptional()
  createdBy?: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @IsOptional()
  updateBy?: string;
}

export const DeviceGroupSchema = SchemaFactory.createForClass(DeviceGroup);
