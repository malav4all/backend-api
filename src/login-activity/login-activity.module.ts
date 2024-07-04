import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoginActivityService } from './login-activity.service';
import { LoginActivityResolver } from './login-activity.resolver';
import {
  LoginActivitySchema,
  LoginActivity,
} from './entity/login-activity.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LoginActivity.name, schema: LoginActivitySchema },
    ]),
  ],
  providers: [LoginActivityResolver, LoginActivityService],
  exports: [LoginActivityService],
})
export class LoginActivityModule {}
