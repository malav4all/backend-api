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

  @Field()
  @Prop({ text: true })
  @Column()
  accountId: string;

  @Field()
  @Prop({ text: true })
  @Column()
  name: string;

  @Field()
  @Prop({ text: true })
  @Column()
  type: string;

  @Field()
  @Prop({ text: true })
  @Column()
  address: string;

  @Field()
  @Prop({ text: true })
  @Column()
  city: string;

  @Field()
  @Prop({ text: true })
  @Column()
  state: string;

  @Field()
  @Prop({ text: true })
  @Column()
  area: string;

  @Field()
  @Prop({ text: true })
  @Column()
  district: string;

  @Field()
  @Prop({ text: true })
  @Column()
  pinCode: string;

  @Field()
  @Prop({ text: true })
  @Column()
  contactName: string;

  @Field()
  @Prop({ text: true })
  @Column()
  contactEmail: string;

  @Field()
  @Prop({ text: true })
  @Column()
  contactPhone: string;

  @Field()
  @Prop({ text: true })
  @Column()
  gstIn: string;

  @Field()
  @Prop({ text: true })
  @Column()
  aadharCardNo: string;

  @Field()
  @Prop({ text: true })
  @Column()
  createdBy: string;

  @Field()
  @Prop({ text: true })
  @Column()
  updatedBy: string;
}
export const EntitesSchema = SchemaFactory.createForClass(Entites);
