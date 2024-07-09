import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field, Float } from '@nestjs/graphql';
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { Document } from 'mongoose';
import { IsOptional } from 'class-validator';

@ObjectType()
class PropertyTypeEntity {
  @Field({ nullable: true })
  @IsOptional()
  name?: string;
}

@ObjectType()
class GeoJsonGeometryEntity {
  @Field(() => String)
  type: string;

  @Field(() => [Float])
  coordinates: number[];

  @Field(() => Float)
  @IsOptional()
  radius?: number;
}

@ObjectType()
class GeoJsonEntity {
  @Field(() => String)
  type: string;

  @Field(() => GeoJsonGeometryEntity)
  geometry: GeoJsonGeometryEntity;

  @Field(() => PropertyTypeEntity, { nullable: true })
  @IsOptional()
  properties?: PropertyTypeEntity;
}
@ObjectType()
class AddressEntityType {
  @Field({ nullable: true })
  zipCode: string;

  @Field({ nullable: true })
  country: string;

  @Field({ nullable: true })
  state: string;

  @Field({ nullable: true })
  area: string;

  @Field({ nullable: true })
  city: string;

  @Field({ nullable: true })
  district: string;
}

@Schema({ timestamps: true })
@ObjectType()
@Entity()
export class Geozone {
  @Field()
  @ObjectIdColumn()
  _id: string;

  @Field()
  @Prop({ text: true })
  @Column()
  locationId: string;

  @Field()
  @Prop({ text: true })
  @Column()
  accountId: string;

  @Field()
  @Prop({ text: true })
  @Column()
  name: string;

  @Field(() => String)
  @Prop({ text: true })
  @Column()
  description: string;

  @Field()
  @Prop()
  @Column()
  @IsOptional()
  locationType: string;

  @Field()
  @Prop({ text: true })
  @Column()
  @IsOptional()
  mobileNumber: number;

  @Field(() => AddressEntityType)
  @Prop()
  @Column()
  address: AddressEntityType;

  @Field(() => GeoJsonEntity)
  @Prop()
  @Column()
  geoCodeData: GeoJsonEntity;

  @Field(() => String)
  @Prop()
  @Column()
  finalAddress: string;

  @Field()
  @Prop()
  @Column()
  createdBy: string;
}

export const GeozoneSchema = SchemaFactory.createForClass(Geozone);
