import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import GraphQLJSON from 'graphql-type-json';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@ObjectType()
export class FieldInputEntity {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  label: string;

  @Field(() => Boolean, { nullable: true })
  required: boolean;

  @Field({ nullable: true })
  type: string;
}

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
  accountId: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  formTitle: string;

  @Column()
  @Prop({ text: true })
  @Field(() => [FieldInputEntity], { nullable: true })
  fields: [FieldInputEntity];

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  createdBy: string;

  @Field(() => Boolean, { nullable: true })
  @Prop({ text: true })
  @Column()
  isFormEnable: boolean;

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
