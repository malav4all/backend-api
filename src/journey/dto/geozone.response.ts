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
  @Field()
  @ObjectIdColumn()
  _id: string;

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
  locationType: string;

  @Field()
  @Prop({ text: true })
  @Column()
  mobileNumber: string;

  @Field(() => AddressEntityTypeResponse)
  @Prop()
  @Column()
  address: AddressEntityTypeResponse;

  @Field(() => GeoJsonEntityResponse)
  @Prop()
  @Column()
  geoCodeData: GeoJsonEntityResponse;

  @Field()
  @Prop()
  @Column()
  finalAddress: string;

  @Field()
  @Prop()
  @Column()
  createdBy: string;
}
