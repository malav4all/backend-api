import { ObjectType, Field } from '@nestjs/graphql';
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
