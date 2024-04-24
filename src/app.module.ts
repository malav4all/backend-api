import { Module } from '@nestjs/common';
import { join } from 'path';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AssertAssingmentModuleModule } from './assert-asingment/assert-asingment.module';
import { GeozoneModule } from './geozone/geozone.module';
import { LocationTypeModule } from './location-type/location-type.module';
import { JourneyModule } from './journey/journey.module';
import { InfluxService } from './helper/comman/influx-db/influx-db.connection';
import { MqttService } from './helper/comman/mqtt/mqtt-service.connection';
import { MqttResolver } from './helper/comman/mqtt/mqtt.resolver';
import { DashboardModule } from './dashboard/dashboard.module';
import { InfluxResolver } from './helper/comman/influx-db/influx-resolver';
import { RedisModule } from './redis/redis.module';
import { AlertModule } from './alert/alert.module';
import { DeviceGroupModule } from './device-group/device-group.module';

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
    LocationTypeModule,
    JourneyModule,
    DashboardModule,
    RedisModule,
    AlertModule,
    DeviceGroupModule,
  ],
  providers: [InfluxService, InfluxResolver, MqttResolver, MqttService],
  exports: [InfluxService],
})
export class AppModule {}
