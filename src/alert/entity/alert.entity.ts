import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@ObjectType()
class AlertEntityConfig {
  @Prop()
  @Column()
  @Field({ nullable: true })
  event: string;

  @Field(() => GraphQLJSON)
  @Prop({ type: typeof GraphQLJSON })
  @Column()
  location: typeof GraphQLJSON;

  @Prop()
  @Column()
  @IsOptional()
  @Field({ nullable: true, defaultValue: false })
  isAlreadyGenerateAlert?: boolean;

  @Prop()
  @Column()
  @IsOptional()
  @Field({ nullable: true })
  startDate?: string;

  @Prop()
  @Column()
  @IsOptional()
  @Field({ nullable: true })
  endDate?: string;

  @Prop()
  @Column()
  @IsOptional()
  @Field({ nullable: true })
  startAlertTime?: string;

  @Prop()
  @Column()
  @IsOptional()
  @Field({ nullable: true })
  endAlertTime?: string;
}

@ObjectType()
class AlertConfigEntityData {
  @Prop()
  @Column()
  @Field(() => [String], { nullable: true })
  imei: string[];

  @Prop()
  @Column()
  @Field(() => [AlertEntityConfig], { nullable: true })
  alertData: [AlertEntityConfig];
}

@Schema({ timestamps: true })
@ObjectType()
@Entity()
export class Alert {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Prop()
  @Column()
  @Field({ nullable: true })
  alertName: string;

  @Prop()
  @Column()
  @Field({ nullable: true })
  mobileNo: string;

  @Prop()
  @Column()
  @Field(() => AlertConfigEntityData, { nullable: true })
  alertConfig: AlertConfigEntityData;

  @Prop()
  @Column()
  @IsOptional()
  @Field({ nullable: true, defaultValue: false })
  isAllSystemAlert?: boolean;

  @Prop()
  @Column()
  @Field({ nullable: true })
  createdBy: string;
}

export type AlertDocument = Alert & Document;
export const AlertSchema = SchemaFactory.createForClass(Alert);
