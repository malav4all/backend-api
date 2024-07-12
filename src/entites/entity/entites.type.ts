import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Column, Entity, ObjectIdColumn, Index } from 'typeorm';

@Schema({ timestamps: true })
@ObjectType()
@Entity()
export class Entites {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  accountId: string;

  @Field(() => [String], { nullable: true })
  @Prop({ text: true })
  @Column()
  tripTypeList: string[];

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  name: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  type: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  address: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  city: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  state: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  area: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column({ nullable: true })
  district: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  pinCode: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  contactName: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  contactEmail: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  contactPhone: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  gstIn: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  aadharCardNo: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  createdBy: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  updatedBy: string;
}
export const EntitesSchema = SchemaFactory.createForClass(Entites);
