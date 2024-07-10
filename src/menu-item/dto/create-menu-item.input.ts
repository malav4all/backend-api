import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateMenuItemInput {
  @Field()
  icon: string;

  @Field()
  activeIcon: string;

  @Field()
  text: string;

  @Field()
  link: string;

  @Field()
  pageName: string;

  @Field()
  visibleInSidebar: boolean;

  @Field(() => [String], { nullable: true })
  accessToResource: string[];

  @Field(() => [CreateMenuItemInput], { nullable: true })
  subMenu: CreateMenuItemInput[];
}
