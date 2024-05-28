import { Upload } from '@imz/helper/comman/scalar/Upload.scalar';
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateIndustryInput {
  @Field({ nullable: true })
  name: string;
  @Field(() => [String], { nullable: true })
  code: string[];
  @Field({ nullable: true })
  description: string;
  @Field({ nullable: true })
  file: Upload;
}

@InputType()
export class IndustryInput {
  @Field(() => Int, { nullable: true })
  page: typeof Int;
  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class SearchIndustryInput {
  @Field({ nullable: true })
  search: string;

  @Field(() => Int, { nullable: true })
  page: typeof Int;

  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}

@InputType()
export class checkExitIndustryInput {
  @Field({ nullable: true })
  name: string;
}

@InputType()
export class fetchIndustryNameCodeInput {
  @Field({ nullable: true })
  _id: string;
}
