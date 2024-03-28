import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Column, Entity, ObjectIdColumn, Index } from 'typeorm';

@Schema({ timestamps: true })
@ObjectType()
@Entity()
export class LocationType {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Field()
  @Prop({ text: true })
  @Column()
  type: string;

  @Field()
  @Prop({ text: true })
  @Column()
  createdBy: string;
}
export type LocationTypeDocument = LocationType & Document;
export const LocationTypeSchema = SchemaFactory.createForClass(LocationType);
LocationTypeSchema.index({
  type: 'text',
});
