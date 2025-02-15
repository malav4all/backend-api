import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Schema({ timestamps: true })
@ObjectType()
@Entity()
export class LocationType {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Field()
  @Prop({ text: true })
  @Column()
  type: string;

  @Field()
  @Prop({ text: true })
  @Column()
  createdBy: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  updatedBy?: string;
}

export const LocationTypeSchema = SchemaFactory.createForClass(LocationType);
