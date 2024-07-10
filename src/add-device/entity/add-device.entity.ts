import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Schema({ timestamps: true })
@ObjectType()
@Entity()
export class AddDevice {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Field()
  @Prop({ text: true })
  @Column()
  imei: string;

  @Field()
  @Prop({ text: true })
  @Column()
  deviceModelCode: string;

  @Field()
  @Prop({ text: true })
  @Column()
  deviceModelName: string;

  @Field()
  @Prop({ text: true })
  @Column()
  deviceModelType: string;

  @Field()
  @Prop({ text: true })
  @Column()
  deviceId: string;

  @Field()
  @Prop({ text: true })
  @Column()
  createdBy: string;

  @Field()
  @Prop({ text: true })
  @Column()
  updatedBy: string;
}

export type AddDeviceDocument = AddDevice & Document;
export const AddDeviceSchema = SchemaFactory.createForClass(AddDevice);
