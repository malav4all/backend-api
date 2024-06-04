import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { now, Document, Types } from 'mongoose';
import { IsOptional } from 'class-validator';
import { DeviceGroup } from '@imz/device-group/entities/device-group.entity';
import { IndustryType } from '../dto/industry.response.type';
import { RoleResponseType } from '../dto/role.response';
import { AccountResponseType } from '../dto/account.response.type';

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
  avatar: string;

  @Field()
  @Prop()
  @Column()
  password: string;

  @Field({ defaultValue: false })
  @Prop()
  @Column()
  active: boolean;

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

  @Field({ defaultValue: true })
  @Prop({ default: now() })
  @Column()
  emailVerified: boolean;

  @Field({ defaultValue: true })
  @Prop({ default: now() })
  @Column()
  mobileVerified: boolean;

  @Field()
  @Prop({ type: Types.ObjectId, ref: 'AccountModule', text: true })
  accountId: AccountResponseType;

  @Field()
  @Column()
  @Prop({ type: Types.ObjectId, ref: 'Role', text: true })
  roleId: RoleResponseType;

  @Field()
  @Column()
  @Prop({ type: Types.ObjectId, ref: 'Industry', text: true })
  @IsOptional()
  industryType?: IndustryType;

  @Field()
  @Column()
  @Prop()
  @IsOptional()
  otp?: string;

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
  accountId: 'text',
  roleId: 'text',
  industryType: 'text',
});
