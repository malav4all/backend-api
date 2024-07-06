import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Column, Entity, ObjectIdColumn, Index } from 'typeorm';

@Schema({ timestamps: true })
@ObjectType()
@Entity()
export class UserAccess {
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
  userId: string;

  @Field(() => [String])
  @Prop({ text: true })
  @Column()
  deviceGroup: string[];

  @Field(() => [String])
  @Prop({ text: true })
  @Column()
  entites: string[];

  @Field(() => [String])
  @Prop({ text: true })
  @Column()
  devicesImei: string[];

  @Field()
  @Prop({ text: true })
  @Column()
  createdBy: string;

  @Field()
  @Prop({ text: true })
  @Column()
  updatedBy: string;
}
export const UserAccessSchema = SchemaFactory.createForClass(UserAccess);
