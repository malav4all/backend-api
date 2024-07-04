import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { Document } from 'mongoose';
import GraphQLJSON from 'graphql-type-json';
@Schema({ timestamps: true })
@ObjectType()
@Entity()
export class LoginActivity {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Field({ nullable: true })
  @Prop()
  @Column()
  loginTime: Date;

  @Field({ nullable: true })
  @Prop()
  @Column()
  logoutTime: Date;

  @Field(() => GraphQLJSON)
  @Prop({ type: typeof GraphQLJSON })
  @Column()
  user: typeof GraphQLJSON;

  @Field(() => GraphQLJSON, { nullable: true })
  @Prop({ type: typeof GraphQLJSON })
  @Column()
  systemInfo: typeof GraphQLJSON;
}

export type LoginActivityDocument = LoginActivity & Document;
export const LoginActivitySchema = SchemaFactory.createForClass(LoginActivity);
