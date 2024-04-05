import { ObjectType, Field, Float } from '@nestjs/graphql';
@ObjectType()
export class PaginatorInfo {
  @Field({ nullable: true })
  count: number;
  @Field({ nullable: true })
  currentPage: number;
  @Field({ nullable: true })
  firstItem: number;
  @Field({ nullable: true })
  hasMorePages: boolean;
  @Field({ nullable: true })
  lastItem: number;
  @Field({ nullable: true })
  lastPage: number;
  @Field({ nullable: true })
  perPage: number;
  @Field({ nullable: true })
  total: number;
}

@ObjectType()
export class Coordinate {
  @Field(() => String)
  label: string;

  @Field(() => Float)
  speed: number;

  @Field(() => Float)
  satellites: number;

  @Field(() => String)
  gps: string;

  @Field(() => Float)
  direction: number;

  @Field(() => Float)
  lat: number;

  @Field(() => Float)
  lng: number;
}
