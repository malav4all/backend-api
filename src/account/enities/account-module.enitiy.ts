import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { Document, Types } from 'mongoose';
import { IsOptional } from 'class-validator';

import { IndustryTypeResponse } from '../dto/industry.type';

@ObjectType()
export class DataType {
  @Field({ nullable: true })
  key: string;
  @Field({ nullable: true })
  value: string;
}
@Schema({ timestamps: true })
@Entity()
@ObjectType()
export class Account {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  @IsOptional()
  accountLogo?: string;

  @Field()
  @Prop({ text: true })
  @Column()
  accountName?: string;

  @Field()
  @Prop({ type: Types.ObjectId, ref: 'Industry' })
  industryType: IndustryTypeResponse;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  @IsOptional()
  accountPanNo?: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  @IsOptional()
  accountGstNo?: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  @IsOptional()
  parentId?: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  @IsOptional()
  accountAadharNo?: string;

  @Field()
  @Prop({ text: true })
  @Column()
  accountAddress?: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  @IsOptional()
  accountState?: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  @IsOptional()
  accountCity?: string;

  @Field()
  @Prop({ text: true })
  @Column()
  accountContactName?: string;

  @Field()
  @Prop({ text: true })
  @Column()
  accountContactEmail?: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  @IsOptional()
  accountContactMobile?: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  @IsOptional()
  remarks?: string;

  @Field(() => [String], { nullable: true })
  @Prop({ text: true })
  @Column()
  @IsOptional()
  accountAuthMobile?: string[];

  @Field({ nullable: true })
  @Prop()
  @Column()
  @IsOptional()
  accountApiKey?: string;

  @Field(() => [DataType])
  @Prop()
  @Column()
  @IsOptional()
  accountConfiguration?: [DataType];

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  @IsOptional()
  accountCreatedBy?: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  @IsOptional()
  nodeSequence?: number;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  tenantId: string;

  @Field({ nullable: true })
  @Prop()
  @Column()
  @IsOptional()
  updatedBy?: string;

  @Field({ nullable: true })
  @Prop()
  @Column()
  @IsOptional()
  isDelete?: boolean;
}

export type AccountDocument = Account & Document;
export const AccountSchema = SchemaFactory.createForClass(Account);
AccountSchema.index({ accountName: 'text' });
