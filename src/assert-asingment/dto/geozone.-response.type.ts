import { Field, Float, ObjectType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import { IsOptional } from 'class-validator';
import { Column, ObjectIdColumn } from 'typeorm';

@ObjectType()
class PropertyTypeAssetEntity {
  @Field({ nullable: true })
  @IsOptional()
  name?: string;
}

@ObjectType()
class GeoJsonGeometryAssetEntity {
  @Field(() => String)
  type: string;

  @Field(() => [Float])
  coordinates: number[];

  @Field(() => Float)
  @IsOptional()
  radius?: number;
}

@ObjectType()
class GeoJsonAssetEntity {
  @Field(() => String)
  type: string;

  @Field(() => GeoJsonGeometryAssetEntity)
  geometry: GeoJsonGeometryAssetEntity;

  @Field(() => PropertyTypeAssetEntity, { nullable: true })
  @IsOptional()
  properties?: PropertyTypeAssetEntity;
}
@ObjectType()
class AddressAssetEntityType {
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

@ObjectType()
export class GeozoneAsset {
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
  @IsOptional()
  locationType: string;

  @Field()
  @Prop({ text: true })
  @Column()
  @IsOptional()
  mobileNumber: number;

  @Field(() => AddressAssetEntityType)
  @Prop()
  @Column()
  address: AddressAssetEntityType;

  @Field(() => GeoJsonAssetEntity)
  @Prop()
  @Column()
  geoCodeData: GeoJsonAssetEntity;

  @Field(() => String)
  @Prop()
  @Column()
  finalAddress: string;

  @Field()
  @Prop()
  @Column()
  createdBy: string;
}
