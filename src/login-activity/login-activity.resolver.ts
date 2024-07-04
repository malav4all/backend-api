import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { LoginActivityService } from './login-activity.service';
import { LoginActivityResponse } from './dto/login.activity.response';
import {
  LoginActivityFetchInput,
  LogoutInput,
  SearchLoginActivityInput,
} from './dto/login-activity.input';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@imz/user/guard';

@Resolver(() => LoginActivityResponse)
export class LoginActivityResolver {
  constructor(private readonly loginActivityService: LoginActivityService) {}

  @UseGuards(new AuthGuard())
  @Mutation(() => LoginActivityResponse)
  async loginActivityListAll(@Args('input') input: LoginActivityFetchInput) {
    try {
      const { count, records } = await this.loginActivityService.findAll(input);
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Login Activity list available.',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => String)
  async logoutUser(
    @Args('input') input: LogoutInput,
    @Context() context
  ): Promise<string> {
    const success = await this.loginActivityService.logout(context);
    return success ? 'Logout successful.' : 'Logout failed.';
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => LoginActivityResponse)
  async searchLoginActivity(@Args('input') input: SearchLoginActivityInput) {
    try {
      const { records, count } =
        await this.loginActivityService.searchLoginActivity(input);
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'LoginActivity list available.',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
