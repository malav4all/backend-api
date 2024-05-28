import { ObjectType, Field } from '@nestjs/graphql';
import { CustomerModule } from '../enities/customer-module.enitiy';
import { PaginatorInfo } from '@imz/helper';

@ObjectType()
export class CustomerModuleResponse {
  @Field(() => PaginatorInfo, { nullable: true })
  paginatorInfo: PaginatorInfo;
  @Field({ nullable: true })
  success: number;
  @Field({ nullable: true })
  message: string;
  @Field(() => [CustomerModule])
  data: [CustomerModule];
}
