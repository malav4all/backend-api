import { Prop } from '@nestjs/mongoose';
import { ObjectType, Field, Float } from '@nestjs/graphql';
import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { IsOptional } from 'class-validator';

@ObjectType()
class PropertyTypeEntityResponse {
  @Field({ nullable: true })
  @IsOptional()
  name?: string;
}

@ObjectType()
class GeoJsonGeometryEntityResponse {
  @Field(() => String)
  type: string;

  @Field(() => [Float])
  coordinates: number[];

  @Field(() => Float)
  @IsOptional()
  radius?: number;
}

@ObjectType()
class GeoJsonEntityResponse {
  @Field(() => String)
  type: string;

  @Field(() => GeoJsonGeometryEntityResponse)
  geometry: GeoJsonGeometryEntityResponse;

  @Field(() => PropertyTypeEntityResponse, { nullable: true })
  @IsOptional()
  properties?: PropertyTypeEntityResponse;
}

@ObjectType()
class AddressEntityTypeResponse {
  @Field({ nullable: true })
  zipCode?: string;

  @Field({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  area?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  district?: string;
}

@ObjectType()
export class JourneyResponse {
  @Field({ nullable: true })
  @ObjectIdColumn()
  _id: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  name: string;

  @Field(() => String, { nullable: true })
  @Prop({ text: true })
  @Column()
  description: string;

  @Field({ nullable: true })
  @Prop()
  @Column()
  locationType: string;

  @Field({ nullable: true })
  @Prop({ text: true })
  @Column()
  mobileNumber: string;

  @Field(() => AddressEntityTypeResponse, { nullable: true })
  @Prop()
  @Column()
  address: AddressEntityTypeResponse;

  @Field(() => GeoJsonEntityResponse, { nullable: true })
  @Prop()
  @Column()
  geoCodeData: GeoJsonEntityResponse;

  @Field({ nullable: true })
  @Prop()
  @Column()
  finalAddress: string;

  @Field({ nullable: true })
  @Prop()
  @Column()
  createdBy: string;
}
