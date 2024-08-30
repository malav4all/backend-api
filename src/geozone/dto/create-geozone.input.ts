import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
class GeoJsonGeometry {
  @Field(() => String)
  type: string;

  @Field(() => [Float])
  coordinates: number[];

  @Field(() => Float)
  @IsOptional()
  radius?: number;
}

@InputType()
class GeoJsonData {
  @Field(() => String)
  type: string;

  @Field(() => GeoJsonGeometry)
  geometry: GeoJsonGeometry;
}

@InputType()
class AddressType {
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

@InputType()
export class CreateGeoZoneInput {
  @Field({ nullable: true })
  locationId: string;

  @Field({ nullable: true })
  accountId: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  locationType: string;

  @Field(() => Number, { nullable: true })
  mobileNumber: number;

  @Field(() => AddressType, { nullable: true })
  address: AddressType;

  @Field(() => String, { nullable: true })
  finalAddress: string;

  @Field(() => GeoJsonData, { nullable: true })
  geoCodeData: GeoJsonData;

  @Field({ nullable: true })
  createdBy: string;
}

@InputType()
export class GeozoneInput {
  @Field({ nullable: true })
  accountId: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}
