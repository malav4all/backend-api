import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { now, Document } from 'mongoose';
import { IsOptional } from 'class-validator';
import { DeviceGroup } from '@imz/device-group/entities/device-group.entity';

@Schema({ timestamps: true })
@ObjectType()
@Entity()
export class User {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Field()
  @Prop({ text: true })
  @Column()
  firstName: string;

  @Field()
  @Prop()
  @Column()
  lastName: string;

  @Field()
  @Prop({ text: true })
  @Column()
  email: string;

  @Field()
  @Prop({ text: true })
  @Column()
  @IsOptional()
  mobileNumber: string;

  @Field()
  @Prop()
  @Column()
  userName: string;

  @Field()
  @Prop()
  @Column()
  password: string;

  @Field()
  @Prop()
  @Column()
  createdBy: string;

  @Field({ nullable: true })
  @Prop({ default: now() })
  @Column()
  createdAt: Date;

  @Field({ nullable: true })
  @Prop({ default: now() })
  @Column()
  updatedAt: Date;

  @Field()
  @Column()
  @Prop()
  @IsOptional()
  otp?: string;

  @Field({ nullable: true })
  @Prop()
  @Column()
  roleId: string;

  @Field({ nullable: true })
  @Prop()
  @Column()
  deviceGroupId: string;

  @Field(() => DeviceGroup, { nullable: true })
  @Prop({ required: false })
  deviceGroup?: DeviceGroup;

  @Field({ nullable: true, defaultValue: 'Active' })
  @Prop({ text: true, default: 'Active' })
  @Column({ default: 'Active' })
  status: string;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({
  firstName: 'text',
  email: 'text',
  mobileNumber: 'text',
  createdBy: 'text',
});
