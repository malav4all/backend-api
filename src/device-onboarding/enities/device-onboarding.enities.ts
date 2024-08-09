import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { IsOptional } from 'class-validator';

@Schema({ timestamps: true })
@Entity()
@ObjectType()
export class DeviceOnboarding {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Field({ nullable: true })
  @Column()
  @Prop({ text: true })
  @IsOptional()
  location?: string;

  @Field({ nullable: true })
  @Column()
  @Prop({ text: true })
  @IsOptional()
  deviceName?: string;

  @Field({ nullable: true })
  @Column()
  @Prop({ text: true })
  @IsOptional()
  accountTransferBy?: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  accountId: string;

  @Field(() => [String], { nullable: true })
  @Prop()
  @Column()
  @IsOptional()
  deviceOnboardingSimNo?: string[];

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  @IsOptional()
  deviceOnboardingIMEINumber: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  @IsOptional()
  businessModel: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  @IsOptional()
  createdBy: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  @IsOptional()
  updatedBy?: string;
}

export const DeviceOnboardingSchema =
  SchemaFactory.createForClass(DeviceOnboarding);
