import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { UserService } from './user.service';
import {
  CreateUserInput,
  LoginUserInput,
  ChangePasswordInput,
  UserInput,
  SearchUsersInput,
} from './dto/create-user.input';
import { UserResponse } from './dto/response';
import { LoginResponse } from './dto/login.response';
import { UpdateUserInput } from './dto/update-user.input';
import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './guard';

@Resolver(() => UserResponse)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  // @UseGuards(new AuthGuard())
  @Query(() => UserResponse)
  async createUser(@Args('input') input: CreateUserInput) {
    try {
      const record = await this.userService.create(input);
      return {
        success: record ? 1 : 0,
        message: record
          ? 'Record created.'
          : 'Record not created. Please try again.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => UserResponse)
  async addUser(@Args('input') input: CreateUserInput) {
    try {
      const record = await this.userService.create(input);
      return {
        success: record ? 1 : 0,
        message: record
          ? 'Record created.'
          : 'Record not created. Please try again.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Mutation(() => UserResponse)
  async forgetPassword(@Args('input') input: ChangePasswordInput) {
    try {
      const record = await this.userService.change(input);
      return {
        success: record ? 1 : 0,
        message: record
          ? 'Password Change Successful.'
          : 'Password change failed. Please try again.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // @UseGuards(new AuthGuard())
  @Mutation(() => UserResponse)
  async changePassword(@Args('input') input: ChangePasswordInput) {
    try {
      const record = await this.userService.change(input);
      return {
        success: record ? 1 : 0,
        message: record
          ? 'Password Change Successful.'
          : 'Password change failed. Please try again.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Mutation(() => LoginResponse)
  async loginUser(@Args('input') input: LoginUserInput) {
    try {
      try {
        const res = await this.userService.login(input);
        return {
          data: res,
        };
      } catch (error) {
        return {
          success: 0,
          message: error.message || 'An error occurred during login.',
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => UserResponse)
  async userListAll(@Args('input') input: UserInput, @Context() context) {
    try {
      const getLoggedInUser = context.user._id;
      const { count, records } = await this.userService.findAll(input);
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'User list available.',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => UserResponse)
  async updateUser(@Args('input') input: UpdateUserInput) {
    try {
      const record = await this.userService.update(input);
      return {
        success: record ? 1 : 0,
        message: record
          ? 'Records update successfully.'
          : 'Technical issue please try again.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => UserResponse)
  async deleteUser(@Args('input') input: UpdateUserInput) {
    try {
      const record = await this.userService.softDelete(input);
      return {
        success: record ? 1 : 0,
        message: record
          ? 'Records Delete successfully.'
          : 'Technical issue please try again.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // @UseGuards(new AuthGuard())
  @Mutation(() => UserResponse)
  async searchUsers(@Args('input') input: SearchUsersInput) {
    try {
      const { records, count } = await this.userService.searchUsers(input);
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'User list available.',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Mutation(() => String)
  async refreshToken(@Context('req') request: Request) {
    try {
      const auth = request.headers['authorization'];
      if (auth.split(' ')[0] !== 'Bearer') {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }
      const token = auth.split(' ')[1];
      const res = await this.userService.refreshToken(token);
      return res.accessToken;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
