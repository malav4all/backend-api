import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { Document, Types } from 'mongoose';
import { IsOptional } from 'class-validator';
import { RoleResponse } from '@imz/role/dto/response';

@ObjectType()
export class ValueAccountModule {
  @Field({ nullable: true })
  key: string;
  @Field({ nullable: true })
  value: string;
}
@ObjectType()
export class DeviceOnboardingAccountResponseType {
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

  // @Field()
  // @Prop({ type: Types.ObjectId, ref: 'Industry' })
  // industryType: DeviceOnboardingIndustryTypeResponse;

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

  @Field(() => [ValueAccountModule])
  @Prop()
  @Column()
  @IsOptional()
  accountConfiguration?: [ValueAccountModule];

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
