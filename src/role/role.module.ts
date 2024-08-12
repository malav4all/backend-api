import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleService } from './role.service';
import { RoleResolver } from './role.resolver';
import { RoleSchema, Role } from './entities/role.entity';
import { UserModule } from '@imz/user/user.module';
import { AccountModule } from '@imz/account/account.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    UserModule,
    AccountModule,
  ],
  providers: [RoleResolver, RoleService],
  exports: [RoleService],
})
export class RoleModule {}
