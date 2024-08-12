import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { Document } from 'mongoose';
import { IsObject, IsOptional } from 'class-validator';

@Schema({ timestamps: true })
@ObjectType()
@Entity()
export class Industry {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Field()
  @Prop({ text: true })
  @Column()
  name: string;

  @Field(() => [String])
  @Prop({ text: true })
  @Column()
  code: string[];

  @Field()
  @Prop({ text: true })
  @Column()
  description: string;

  // @Field()
  // @Prop({ text: true })
  // @Column()
  // @IsOptional()
  // file?: string;

  @Field({ nullable: true })
  @Prop()
  @Column()
  lastUpdated: Date;
}

export type IndustryDocument = Industry & Document;
export const IndustrySchema = SchemaFactory.createForClass(Industry);

IndustrySchema.index({ name: 'text', description: 'text', code: 'text' });
