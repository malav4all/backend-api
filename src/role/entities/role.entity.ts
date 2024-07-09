import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { Document, Types } from 'mongoose';
import { IndustryResponseType } from '../dto/industry.response';

@ObjectType()
export class Values {
  @Field({ nullable: true })
  name: string;
  @Field(() => [String])
  permissions: string[];
}

@Schema({ timestamps: true })
@ObjectType()
@Entity()
export class Role {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Field()
  @Prop({ text: true })
  @Column()
  name: string;

  @Field({ nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'Industry' })
  @Column()
  industryType: IndustryResponseType;

  @Field()
  @Prop({ text: true })
  @Column()
  description: string;

  @Field(() => [Values])
  @Prop()
  @Column()
  resources: [Values];

  @Field()
  @Prop()
  @Column()
  isDelete: boolean;

  @Field({ nullable: true })
  @Prop()
  @Column()
  lastUpdated: Date;
}

export type RoleDocument = Role & Document;
export const RoleSchema = SchemaFactory.createForClass(Role);
RoleSchema.index({
  name: 'text',
  description: 'text',
});
