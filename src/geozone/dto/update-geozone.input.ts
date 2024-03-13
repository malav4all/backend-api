import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateGeoZoneInput } from './create-geozone.input';

@InputType()
export class UpdateGeozoneInput extends PartialType(CreateGeoZoneInput) {
  @Field()
  _id: string;
}
