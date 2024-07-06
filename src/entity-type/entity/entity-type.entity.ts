import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Column, Entity, ObjectIdColumn, Index } from 'typeorm';

@Schema({ timestamps: true })
@ObjectType()
@Entity()
export class EntityType {
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
  description: string;

  @Field()
  @Prop({ text: true })
  @Column()
  createdBy: string;

  @Field()
  @Prop({ text: true })
  @Column()
  updatedBy: string;
}
export const EntityTypeSchema = SchemaFactory.createForClass(EntityType);
