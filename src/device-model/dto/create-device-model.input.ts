import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class CreateDeviceModelValuesInput {
  @Field({ nullable: true })
  key: string;
  @Field()
  value: string;
}

@InputType()
export class CreateDeviceModelCommandInput {
  @Field({ nullable: true })
  key: string;
  @Field()
  value: string;
}

@InputType()
export class CreateDeviceModelInput {
  @Field({ nullable: true })
  @IsOptional()
  deviceId?: string;

  @Field()
  deviceModelName: string;

  @Field()
  deviceModel: string;

  @Field({ nullable: true })
  @IsOptional()
  deviceModelType?: string;

  @Field()
  deviceModelIpAddress: string;

  @Field()
  deviceModelPortNumber: number;

  @Field()
  deviceModelSimCount: number;

  @Field()
  deviceModelNetworkType: string;

  @Field()
  deviceModelParser: string;

  @Field(() => [CreateDeviceModelCommandInput], { nullable: true })
  @IsOptional()
  deviceModelCommands?: [CreateDeviceModelCommandInput];

  @Field(() => [CreateDeviceModelValuesInput], { nullable: true })
  @IsOptional()
  deviceModelConfig?: [CreateDeviceModelValuesInput];

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  isDelete: boolean;

  @Field({ nullable: true })
  @IsOptional()
  createdBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  updatedBy?: string;
}

@InputType()
export class DeviceModelInput {
  @Field(() => Int, { nullable: true })
  page: typeof Int;
  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class SearchDeviceModel {
  @Field({ nullable: true })
  search: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class checkDeviceModelInput {
  @Field({ nullable: true })
  deviceModelName: string;
}
