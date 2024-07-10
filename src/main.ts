import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { express as voyagerMiddleware } from 'graphql-voyager/middleware';
import { graphqlUploadExpress } from 'graphql-upload';
import * as expressip from 'express-ip';
import * as requestIp from 'request-ip';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';

const bootstrap = async () => {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use('/voyager', voyagerMiddleware({ endpointUrl: '/graphql' }));
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));
  app.use(expressip().getIpInfoMiddleware);
  app.use(requestIp.mw());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  await app.listen(process.env.PORT);
  logger.log(`Application is running on this port::${process.env.PORT}`);
};

bootstrap().catch((error: any) => {
  const logger = new Logger();
  logger.error(`Error in Application:::${error.message}`);
});
