import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { Document } from 'mongoose';

@ObjectType()
export class IndustryType {
  @Field({ nullable: true })
  @ObjectIdColumn()
  _id: string;

  @Field()
  @Prop()
  @Column()
  name: string;

  @Field(() => [String])
  @Prop()
  @Column()
  code: string[];

  @Field()
  @Prop()
  @Column()
  description: string;

  @Field()
  @Prop()
  @Column()
  lastUpdated: Date;
}
