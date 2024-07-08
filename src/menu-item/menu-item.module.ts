import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuItem, MenuItemSchema } from './entities/menu-item.entity';
import { MenuItemService } from './menu-item.service';
import { MenuItemResolver } from './menu-item.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MenuItem.name, schema: MenuItemSchema },
    ]),
  ],
  providers: [MenuItemResolver, MenuItemService],
  exports: [MenuItemService],
})
export class MenuItemModule {}
