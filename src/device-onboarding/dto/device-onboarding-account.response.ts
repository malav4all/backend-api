import { Prop } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { ObjectIdColumn, Column } from 'typeorm';
import { Types } from 'mongoose';
import { IsOptional } from 'class-validator';
import { DeviceOnboardingIndustryTypeResponse } from './device-onboarding.industry.response';

@ObjectType()
export class DataTypeValue {
  @Field({ nullable: true })
  key: string;
  @Field({ nullable: true })
  value: string;
}
@ObjectType()
export class DeviceOnboardingAccountModuleResponse {
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

  @Field({ nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'Industry' })
  industryType: DeviceOnboardingIndustryTypeResponse;

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

  @Field(() => [DataTypeValue])
  @Prop()
  @Column()
  @IsOptional()
  accountConfiguration?: [DataTypeValue];

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
