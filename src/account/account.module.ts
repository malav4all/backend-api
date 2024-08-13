import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from './enities/account-module.enitiy';
import { AccountResolver } from './account.resolver';
import { AccountService } from './account.service';
import { Role, RoleSchema } from '@imz/role/entities/role.entity';
import { TenantsModule } from '@imz/tenants/tenants.module';
import { InfluxdbService } from '@imz/influx-db/influx-db-.service';
import { UserModule } from '@imz/user/user.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    TenantsModule,
    UserModule,
  ],
  providers: [AccountResolver, AccountService, InfluxdbService],
  exports: [AccountService],
})
export class AccountModule {}
