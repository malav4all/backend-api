import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
@ObjectType()
export class MenuItem {
  @Field()
  _id: string;

  @Field()
  @Prop()
  icon: string;

  @Field()
  @Prop()
  activeIcon: string;

  @Field()
  @Prop()
  text: string;

  @Field()
  @Prop()
  link: string;

  @Field()
  @Prop()
  pageName: string;

  @Field()
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
