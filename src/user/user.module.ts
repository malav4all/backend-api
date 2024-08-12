import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { UserSchema, User } from './entities/user.entity';
import { Role, RoleSchema } from '@imz/role/entities/role.entity';
import {
  MenuItem,
  MenuItemSchema,
} from '@imz/menu-item/entities/menu-item.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    MongooseModule.forFeature([
      { name: MenuItem.name, schema: MenuItemSchema },
    ]),
  ],

  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
