import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { MenuItemService } from './menu-item.service';
import { MenuItemResponse } from './dto/response';
import { InternalServerErrorException } from '@nestjs/common';
import { CreateMenuItemInput } from './dto/create-menu-item.input';
import { MenuItemInput } from './dto/menu-item.input';

@Resolver(() => MenuItemResponse)
export class MenuItemResolver {
  constructor(private readonly menuItemService: MenuItemService) {}

  @Mutation(() => MenuItemResponse)
  async menuItemListAll(@Args('input') input: MenuItemInput) {
    try {
      const res = await this.menuItemService.findAll(input);
      const count = await this.menuItemService.count();
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Menu items list available.',
        data: res,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Mutation(() => MenuItemResponse)
  async createMenuItem(@Args('input') input: CreateMenuItemInput) {
    try {
      const res = await this.menuItemService.create(input);
      return {
        success: 1,
        message: 'Menu item created successfully.',
        data: [res],
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
