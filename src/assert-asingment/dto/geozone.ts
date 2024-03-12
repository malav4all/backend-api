import { Prop } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { ObjectIdColumn, Column } from 'typeorm';

@ObjectType()
export class GeozoneResponse {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  name: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  code: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  description: string;
}
