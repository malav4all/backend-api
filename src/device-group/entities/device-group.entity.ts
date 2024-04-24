import { Journey } from './../../journey/entity/journey.entity';
import { AssertAssingmentModuleEntity } from '@imz/assert-asingment/entities/assert-asingment.enitiy';
import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional } from 'class-validator';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
@ObjectType()
export class DeviceGroup {
  @Field({ nullable: true })
  _id: string;

  @Field()
  @Prop({ text: true })
  deviceGroupName: string;

  @IsOptional()
  @Field(() => [AssertAssingmentModuleEntity], { nullable: true })
  @Prop({
    type: [{ type: Types.ObjectId, ref: 'AssertAssingmentModuleEntity' }],
  })
  imeiData: [AssertAssingmentModuleEntity];

  @Field({ nullable: true })
  @Prop({ text: true })
  @IsOptional()
  createdBy?: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @IsOptional()
  updateBy?: string;
}

export type DeviceGroupDocument = DeviceGroup & Document;

export const DeviceGroupSchema = SchemaFactory.createForClass(DeviceGroup);

DeviceGroupSchema.index({
  deviceGroupName: 'text',
  createdBy: 'text',
});
