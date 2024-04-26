import { ObjectType, Field } from '@nestjs/graphql';
import { PaginatorInfo } from '@imz/helper';
import { AssertAssingmentModuleEntity } from '../entities/assert-asingment.enitiy';

@ObjectType()
export class AssertAssingmentModuleResponse {
  @Field(() => PaginatorInfo, { nullable: true })
  paginatorInfo: PaginatorInfo;
  @Field({ nullable: true })
  success: number;
  @Field({ nullable: true })
  message: string;
  @Field(() => [AssertAssingmentModuleEntity], { nullable: true })
  data: [AssertAssingmentModuleEntity];
}
