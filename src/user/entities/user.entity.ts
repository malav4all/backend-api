import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { now, Document, Types } from 'mongoose';
import { IsOptional } from 'class-validator';
import { RoleResponseType } from '../dto/role.response';
import { AccountResponseType } from '../dto/account.response.type';
import GraphQLJSON from 'graphql-type-json';

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

  @Field(() => GraphQLJSON, { nullable: true })
  @Prop({ type: typeof GraphQLJSON })
  @Column()
  deviceGroup: typeof GraphQLJSON;

  @Field(() => [String], { nullable: true })
  @Prop()
  @Column()
  imeiList: string[];

  @Field({ defaultValue: false })
  @Prop()
  @Column()
  active: boolean;

  @Field({ nullable: true, defaultValue: false })
  @Prop()
  @Column()
  isAccountAdmin: boolean;

  @Field({ nullable: true, defaultValue: false })
  @Prop()
  @Column()
  isSuperAdmin: boolean;

  @Field()
  @Prop()
  @Column()
  createdBy: string;

  @Field()
  @Prop()
  @Column()
  updatedBy: string;

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
  @Prop()
  @Column()
  accountId: string;

  // @Field()
  // @Prop({ type: Types.ObjectId, ref: 'Account', text: true })
  // accountId: AccountResponseType;

  @Field()
  @Column()
  @Prop({ type: Types.ObjectId, ref: 'Role', text: true })
  roleId: RoleResponseType;

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

  @Field({ nullable: true, defaultValue: 'Active' })
  @Prop({ text: true, default: 'Active' })
  @Column({ default: 'Active' })
  status: string;

  @Field({ nullable: true })
  roleName?: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  accountName: string;
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
