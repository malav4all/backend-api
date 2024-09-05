import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { Document } from 'mongoose';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class TripInformationData {
  @Field(() => [String], { nullable: true })
  imei: string[];

  @Field({ nullable: true })
  vehicleNo: string;

  @Field({ nullable: true })
  tripDate: string;

  @Field({ nullable: true })
  driverName: string;

  @Field({ nullable: true })
  driverContactNumber: string;

  @Field({ nullable: true })
  remarks: string;
}

@Schema({ timestamps: true })
@ObjectType()
@Entity()
export class Trip {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Field()
  @Prop({ text: true })
  @Column()
  accountId: string;

  @Field()
  @Prop({ text: true })
  @Column()
  tripId: string;

  @Field()
  @Prop({ text: true })
  @Column()
  status: string;

  @Field()
  @Prop({ text: true })
  @Column()
  primaryAccount: string;

  @Prop({ text: true })
  @Column()
  @Field({ nullable: true })
  tripStartDate: string;

  @Prop({ text: true })
  @Column()
  @Field({ nullable: true })
  tripEndDate: string;

  @Prop({ text: true })
  @Column()
  @Field(() => [TripInformationData], { nullable: true })
  tripData: [TripInformationData];

  @Prop({ type: typeof GraphQLJSON })
  @Column()
  @Field(() => GraphQLJSON, { nullable: true })
  route: typeof GraphQLJSON;

  @Prop({ type: typeof GraphQLJSON })
  @Column()
  @Field(() => GraphQLJSON)
  alertConfig: typeof GraphQLJSON;

  @Prop({ type: typeof GraphQLJSON })
  @Column()
  @Field(() => GraphQLJSON)
  startPoint: typeof GraphQLJSON;

  @Prop({ type: typeof GraphQLJSON })
  @Column()
  @Field(() => GraphQLJSON)
  endPoint: typeof GraphQLJSON;

  @Prop({ type: typeof GraphQLJSON })
  @Column()
  @Field(() => GraphQLJSON, { nullable: true })
  metaData: typeof GraphQLJSON;

  @Prop({ text: true })
  @Column()
  @Field(() => [String], { nullable: true })
  accessAccount: string[];

  @Field()
  @Prop({ text: true })
  @Column()
  createdBy: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  updatedBy: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  createdAt: string;

  @Field({ nullable: true })
  @Prop()
  @Column()
  lastUpdated: Date;

  @Prop({ type: typeof GraphQLJSON })
  @Column()
  @Field(() => GraphQLJSON)
  tripVerification: typeof GraphQLJSON;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  transitType: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  otp: number;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  otpExpiresAt: string;
}

export const TripSchema = SchemaFactory.createForClass(Trip);
