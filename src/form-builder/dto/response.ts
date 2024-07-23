import { ObjectType, Field } from '@nestjs/graphql';
import { PaginatorInfo } from '@imz/helper';
import { FormBuilder } from '../entity/form-builder.entity';

@ObjectType()
export class FormBuilderResponse {
  @Field(() => PaginatorInfo, { nullable: true })
  paginatorInfo: PaginatorInfo;

  @Field({ nullable: true })
  success: number;

  @Field({ nullable: true })
  message: string;

  @Field(() => [FormBuilder])
  data: [FormBuilder];
}
