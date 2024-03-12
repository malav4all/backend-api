import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class CreateAssertAssingmentModuleInput {
  @Field({ nullable: true })
  @IsOptional()
  imei: number;

  @Field()
  boxNumber: number;

  @Field()
  journey: string;

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
