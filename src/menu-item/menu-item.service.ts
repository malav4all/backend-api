import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MenuItem, MenuItemDocument } from './entities/menu-item.entity';
import { MenuItemInput } from './dto/menu-item.input';
import { CreateMenuItemInput } from './dto/create-menu-item.input';
@Injectable()
export class MenuItemService {
  constructor(
    @InjectModel(MenuItem.name)
    private menuItemModel: Model<MenuItemDocument>
  ) {}

  async count() {
    return await this.menuItemModel.count().exec();
  }

  async findAll(input: MenuItemInput) {
    const page = Number(input.page);
    const limit = Number(input.limit);
    const skip = page === -1 ? 0 : (page - 1) * limit;
    const records = await this.menuItemModel
      .find()
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    return records;
  }

  async create(input: CreateMenuItemInput) {
    const createdMenuItem = new this.menuItemModel(input);
    return await createdMenuItem.save();
  }
}
