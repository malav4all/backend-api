import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateLocationTypeInput {
  @Field(() => String)
  type: string;

  @Field(() => String)
  createdBy: string;
}

@InputType()
export class LocationTypeInput {
  @Field(() => Int, { nullable: true })
  page: typeof Int;
  @Field(() => Int, { nullable: true })
  limit: typeof Int;
}
