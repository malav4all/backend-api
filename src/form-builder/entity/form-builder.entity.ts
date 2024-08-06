import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import GraphQLJSON from 'graphql-type-json';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Schema({ timestamps: true })
@ObjectType()
@Entity()
export class FormBuilder {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  formId: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  accountId: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  formTitle: string;

  @Column()
  @Field(() => GraphQLJSON, { nullable: true })
  @Prop({ type: typeof GraphQLJSON })
  fields: typeof GraphQLJSON;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  createdBy: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  updatedBy?: string;

  @Field({ nullable: true })
  @Prop()
  @Column()
  lastUpdated?: Date;
}

export const FormBuilderSchema = SchemaFactory.createForClass(FormBuilder);
