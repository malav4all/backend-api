import { Module } from '@nestjs/common';
import { join } from 'path';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AssertAssingmentModuleModule } from './assert-asingment/assert-asingment.module';
import { GeozoneModule } from './geozone/geozone.module';

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
      // subscriptions: {
      //   verifyClient: (info, next) => {
      //     const authorization = info.req.headers?.authorization as string;
      //     if (!authorization?.startsWith('Bearer ')) {
      //       return next(false);
      //     }
      //     next(true);
      //   },
      // },
      autoSchemaFile: join(process.cwd(), 'src/graphql-schema.gql'),
      context: ({ req }) => ({ headers: req?.headers }),
    }),
    UserModule,
    AssertAssingmentModuleModule,
    GeozoneModule,
  ],
  providers: [],
})
export class AppModule {}
