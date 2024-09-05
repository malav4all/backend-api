import { ObjectType, Field } from '@nestjs/graphql';
import { PaginatorInfo } from '@imz/helper';
import { Trip } from '../entity/trip-module.entity';

@ObjectType()
export class TripResponse {
  @Field(() => PaginatorInfo, { nullable: true })
  paginatorInfo: PaginatorInfo;
  @Field({ nullable: true })
  success: number;
  @Field({ nullable: true })
  message: string;
  @Field(() => [Trip])
  data: [Trip];
}

@ObjectType()
export class BatteryResponse {
  @Field({ nullable: true })
  success: boolean;

  @Field({ nullable: true })
  message: string;
}

@ObjectType()
export class FileUploadResponse {
  @Field({ nullable: true })
  fileName: string;

  @Field({ nullable: true })
  message: string;
}
@ObjectType()
export class TripMetricsResponseWrapper {
  @Field()
  success: number;

  @Field()
  message: string;

  @Field(() => [TripMetricsResponse])
  data: TripMetricsResponse[];
}

@ObjectType()
export class TripMetricsResponse {
  @Field({ nullable: true })
  status: string;

  @Field({ nullable: true })
  count: number;
}
@ObjectType()
export class TripCountResponse {
  @Field({ nullable: true })
  todayActiveTripsCount: number;

  @Field({ nullable: true })
  totalActiveTripsCount: number;
}

@ObjectType()
export class TripOtpSendResponse {
  @Field({ nullable: true })
  success: number;

  @Field({ nullable: true })
  message: string;
}

@ObjectType()
export class TripOtpResponse {
  @Field({ nullable: true })
  success: number;

  @Field({ nullable: true })
  message: string;

  @Field({ nullable: true })
  tripId: string;
}
