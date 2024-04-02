import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class OtpSendResponse {
  @Field({ nullable: true })
  success: number;

  @Field({ nullable: true })
  message: string;
}

@ObjectType()
export class MobileNumberExists {
  @Field({ nullable: true })
  success: number;

  @Field({ nullable: true })
  message: string;
}
