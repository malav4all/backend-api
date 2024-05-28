import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
@ObjectType()
@Entity()
export class CustomerModule {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Field()
  @Prop({ text: true })
  @Column()
  name: string;

  @Field()
  @Prop({ text: true })
  @Column()
  code: string;

  @Field()
  @Prop({ text: true })
  @Column()
  description: string;

  @Field({ nullable: true })
  @Prop()
  @Column()
  lastUpdated: Date;
}

export type CustomerModuleDocument = CustomerModule & Document;
export const CustomerModuleSchema =
  SchemaFactory.createForClass(CustomerModule);

CustomerModuleSchema.index({ name: 'text', code: 'text', description: 'text' });
