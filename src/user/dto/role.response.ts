import { Schema } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, Column } from 'typeorm';

@ObjectType()
@Schema({ timestamps: true })
@Entity()
export class RoleResponseType {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  industryType: string;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  isDelete: boolean;

  @Field({ nullable: true })
  resources: string;
}
