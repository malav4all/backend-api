import { Module } from '@nestjs/common';
import { join } from 'path';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AssertAssingmentModuleModule } from './assert-asingment/assert-asingment.module';
import { GeozoneModule } from './geozone/geozone.module';
import { JourneyModule } from './journey/journey.module';
import { RedisModule } from './redis/redis.module';
import { AlertModule } from './alert/alert.module';
import { DeviceGroupModule } from './device-group/device-group.module';
import { InfluxDbModule } from './influx-db/influx-db.module';
import { IndustryModule } from './industry/industry.module';
import { CustomerModuleModule } from './customer-module/customer-module.module';
import { RoleModule } from './role/role.module';
import { TenantsModule } from './tenants/tenants.module';
import { AccountModule } from './account/account.module';
import { Upload } from './helper/comman/scalar/Upload.scalar';
import { TripModuleModule } from './trip-module/trip-module.module';
import { DeviceOnboardingModule } from './device-onboarding/device-onboarding.module';
import { DeviceSimHistoryModule } from './history/device-sim-history/device-sim-history.module';
import { DeviceOnboardingHistoryModule } from './history/device-onboarding-history/device-onboarding-history.module';
import { LoginActivityModule } from './login-activity/login-activity.module';
import { EntityTypeModule } from './entity-type/entity-type.module';
import { EntitesModule } from './entites/entites.module';
import { UserAccessModule } from './user-access/user-access.module';
import { TripTypeModule } from './trip-type/trip-type.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        uri: process.env.DB_URL,
      }),
    }),

    GraphQLModule.forRoot({
      playground: true,
      installSubscriptionHandlers: true,
      autoSchemaFile: join(process.cwd(), 'src/graphql-schema.gql'),
      context: ({ req }) => ({ headers: req?.headers }),
      subscriptions: {
        'subscriptions-transport-ws': {
          path: '/graphql',
        },
      },
    }),
    UserModule,
    AssertAssingmentModuleModule,
    GeozoneModule,
    JourneyModule,
    RedisModule,
    AlertModule,
    DeviceGroupModule,
    InfluxDbModule,
    IndustryModule,
    CustomerModuleModule,
    RoleModule,
    AccountModule,
    TenantsModule,
    InfluxDbModule,
    TripTypeModule,
    TripModuleModule,
    DeviceOnboardingModule,
    DeviceSimHistoryModule,
    DeviceOnboardingHistoryModule,
    LoginActivityModule,
    EntityTypeModule,
    EntitesModule,
    UserAccessModule,
  ],
  providers: [Upload],
  exports: [],
})
export class AppModule {}
