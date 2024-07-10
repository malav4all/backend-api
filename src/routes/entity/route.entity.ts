import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now } from 'mongoose';
import { Column } from 'typeorm';

@Schema({ timestamps: true })
@ObjectType()
export class Route {
  @Field({ nullable: true })
  _id: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  accountId: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  routeName: string;

  @Field({ nullable: true })
  @Prop({})
  routeData: string;

  @Field({ nullable: true })
  @Prop()
  createdBy: string;

  @Field({ nullable: true })
  @Prop()
  totalDistance: number;

  @Field({ nullable: true })
  @Prop()
  totalDuration: number;

  @Field({ nullable: true })
  @Prop({ default: now() })
  @Column()
  createdAt: Date;

  @Field({ nullable: true })
  @Prop({ default: now() })
  @Column()
  updatedAt: Date;
}

export const RouteSchema = SchemaFactory.createForClass(Route);
