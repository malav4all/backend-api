import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { now, Document, Types } from 'mongoose';
import { IsOptional } from 'class-validator';

@ObjectType()
export class UserResponseType {
  @Field()
  _id: string;

  @Field()
  @Prop({ text: true })
  @Column()
  firstName: string;

  @Field()
  @Prop({ text: true })
  @Column()
  lastName: string;

  @Field()
  @Prop({ text: true })
  @Column()
  email: string;

  @Field()
  @Prop({ text: true })
  @Column()
  mobileNumber: number;

  @Field()
  @Prop({ text: true })
  @Column()
  userName: string;

  @Field()
  @Prop({ text: true })
  @Column()
  avatar: string;

  @Field()
  @Prop({ text: true })
  @Column()
  password: string;

  @Field({ defaultValue: false })
  @Prop()
  @Column()
  active: boolean;

  @Field()
  @Prop({ text: true })
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

  @Field({ defaultValue: true })
  @Prop({ default: now() })
  @Column()
  emailVerified: boolean;

  @Field({ defaultValue: true })
  @Prop({ default: now() })
  @Column()
  mobileVerified: boolean;

  @Field()
  @Prop({ type: Types.ObjectId, ref: 'Account' })
  accountId: string;

  @Field()
  @Column()
  @Prop({ type: Types.ObjectId, ref: 'Role' })
  roleId: string;

  @Field({ nullable: true })
  @Column()
  @Prop({ type: Types.ObjectId, ref: 'Industry' })
  @IsOptional()
  industryType?: string;

  @Field()
  @Column()
  @Prop()
  @IsOptional()
  parentUserId?: string;

  @Field()
  @Column()
  @Prop()
  @IsOptional()
  mainParentId?: string;
}
