import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { PaginatorInfo } from '@imz/helper';
import { DeviceOnboarding } from '../enities/device-onboarding.enities';

@ObjectType()
export class DeviceOnboardingResponse {
  @Field(() => PaginatorInfo, { nullable: true })
  paginatorInfo: PaginatorInfo;
  @Field({ nullable: true })
  success: number;
  @Field({ nullable: true })
  message: string;
  @Field(() => [DeviceOnboarding], { nullable: true })
  data: [DeviceOnboarding];
}

@ObjectType()
export class DeviceOfflineGraphData {
  @Field()
  success: number;

  @Field(() => [Number])
  series: number[];

  @Field(() => [String])
  labels: string[];
}
@ObjectType()
export class XAxis {
  @Field(() => [String])
  categories: string[];
}

@ObjectType()
export class SeriesData {
  @Field()
  name: string;

  @Field(() => [Number])
  data: number[];
}

@ObjectType()
export class DeviceLineGraphData {
  @Field(() => XAxis)
  xaxis: XAxis;

  @Field(() => [SeriesData])
  series: SeriesData[];
}

@ObjectType()
class DeviceOnlineStatus {
  @Field()
  name: string;

  @Field()
  imei: string;

  @Field()
  status: string;

  @Field()
  lastPing: string;

  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;
}

@ObjectType()
export class DeviceOnlineOfflineCount {
  @Field(() => Int)
  totalDeviceCount: number;

  @Field(() => Int)
  online: number;

  @Field(() => Int)
  offline: number;

  @Field(() => [DeviceOnlineStatus])
  data: DeviceOnlineStatus[];
}

@ObjectType()
export class ImeiListResponse {
  @Field()
  success: number;

  @Field(() => [String])
  imeiList: string[];

  @Field()
  message: string;
}
