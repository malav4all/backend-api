import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
@ObjectType()
export class MenuItem {
  @Field({ nullable: true })
  _id: string;

  @Field({ nullable: true })
  @Prop()
  icon: string;

  @Field({ nullable: true })
  @Prop()
  activeIcon: string;

  @Field({ nullable: true })
  @Prop()
  text: string;

  @Field({ nullable: true })
  @Prop()
  link: string;

  @Field({ nullable: true })
  @Prop()
  pageName: string;

  @Field({ nullable: true })
  @Prop()
  visibleInSidebar: boolean;

  @Field(() => [String], { nullable: true })
  @Prop({ type: [String] })
  accessToResource: string[];

  @Field(() => [MenuItem], { nullable: true })
  @Prop({ type: [SchemaFactory.createForClass(MenuItem)] })
  subMenu: MenuItem[];
}

export type MenuItemDocument = MenuItem & Document;
export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
