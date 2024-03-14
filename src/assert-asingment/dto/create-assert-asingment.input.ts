import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class CreateAssertAssingmentModuleInput {
  @Field(() => Float)
  imei: number;

  @Field()
  labelName: string;

  // @Field()
  // journey: string;

  @Field({ nullable: true })
  boxSet: string;

  @Field({ nullable: true })
  @IsOptional()
  createdBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  updatedBy?: string;
}

@InputType()
export class AssertAssingmentModuleInput {
  @Field(() => Int, { nullable: true })
  page: typeof Int;
  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class SearchAssertAssingmentModuleInput {
  @Field({ nullable: true })
  search: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class CheckAssertAssingmentModuleInput {
  @Field({ nullable: true })
  imei: number;
}
