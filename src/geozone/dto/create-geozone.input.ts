import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class CreateGeoZoneInput {
  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  centerNo?: string;

  @Field({ nullable: true })
  type: string;

  @Field({ nullable: true })
  mobileNumber: number;

  @Field({ nullable: true })
  address: string;

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

  @Field({ nullable: true })
  createdBy: string;
}

@InputType()
export class GeozoneInput {
  @Field(() => Int, { nullable: true })
  page: typeof Int;
  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}
