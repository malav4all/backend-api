import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from './enities/account-module.enitiy';
import { AccountResolver } from './account.resolver';
import { AccountService } from './account.service';
import { Role, RoleSchema } from '@imz/role/entities/role.entity';
import { TenantsModule } from '@imz/tenants/tenants.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    TenantsModule,
  ],
  providers: [AccountResolver, AccountService],
  exports: [AccountService],
})
export class AccountModule {}
