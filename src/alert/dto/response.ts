import { ObjectType, Field } from '@nestjs/graphql';
import { PaginatorInfo } from '@imz/helper';
import { Alert } from '../entity/alert.entity';

@ObjectType()
export class AlertResponseData {
  @Field(() => PaginatorInfo, { nullable: true })
  paginatorInfo: PaginatorInfo;
  @Field({ nullable: true })
  success: number;
  @Field({ nullable: true })
  message: string;
  @Field(() => [Alert])
  data: [Alert];
}

@ObjectType()
class AlertReportDataType {
  @Field({ nullable: true })
  time: string;

  @Field({ nullable: true })
  event: string;

  @Field({ nullable: true })
  imei: string;

  @Field({ nullable: true })
  accountId: string;

  @Field({ nullable: true })
  alertMessage: string;

  @Field({ nullable: true })
  latitude: string;

  @Field({ nullable: true })
  longitude: string;
}

@ObjectType()
export class AlertReport {
  @Field({ nullable: true })
  totalCount: number;

  @Field(() => [AlertReportDataType])
  rowData: [AlertReportDataType];
}

@ObjectType()
class DistanceCoordinatesTypeResponse {
  @Field(() => String, { nullable: true })
  latitude: string;

  @Field(() => String, { nullable: true })
  longitude: string;

  @Field(() => String, { nullable: true })
  time: string;
}

@ObjectType()
export class DistanceReportResponse {
  @Field(() => String, { nullable: true })
  imei: string;

  @Field(() => [DistanceCoordinatesTypeResponse], { nullable: true })
  coordinates: [DistanceCoordinatesTypeResponse];
}

@ObjectType()
export class DistanceTrackPlayResponse {
  @Field(() => String, { nullable: true })
  latitude: string;

  @Field(() => String, { nullable: true })
  longitude: string;

  @Field(() => String, { nullable: true })
  time: string;

  @Field(() => String, { nullable: true })
  imei: string;

  @Field(() => String, { nullable: true })
  bearing: string;

  @Field(() => String, { nullable: true })
  speed: string;
}

@ObjectType()
export class DistanceTrackPlayGsmResponse {
  @Field(() => String, { nullable: true })
  latitude: string;

  @Field(() => String, { nullable: true })
  longitude: string;

  @Field(() => String, { nullable: true })
  time: string;

  @Field(() => String, { nullable: true })
  imei: string;

  @Field(() => String, { nullable: true })
  bearing: string;

  @Field(() => String, { nullable: true })
  gsmSignal: string;
}

@ObjectType()
export class DistanceTrackPlayAlertResponse {
  @Field(() => String, { nullable: true })
  latitude: string;

  @Field(() => String, { nullable: true })
  longitude: string;

  @Field(() => String, { nullable: true })
  time: string;

  @Field(() => String, { nullable: true })
  imei: string;

  @Field(() => String, { nullable: true })
  bearing: string;

  @Field(() => String, { nullable: true })
  alertMessage: string;
}

@ObjectType()
export class MapViewResponse {
  @Field(() => String, { nullable: true })
  latitude: string;

  @Field(() => String, { nullable: true })
  longitude: string;

  @Field(() => String, { nullable: true })
  time: string;

  @Field(() => String, { nullable: true })
  imei: string;
}
