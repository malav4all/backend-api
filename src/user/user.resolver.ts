import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { UserService } from './user.service';
import {
  CreateUserInput,
  LoginUserInput,
  ChangePasswordInput,
  UserInput,
  SearchUsersInput,
  OtpInput,
  VerifyOtpInput,
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
import { MobileNumberExists, OtpSendResponse } from './dto/otpsend.response';
import { OtpLoginResponse, OtpResponse } from './dto/otp.response';
import _ from 'lodash';
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
  async userListAll(@Args('input') input: UserInput) {
    try {
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

  @Mutation(() => MobileNumberExists)
  async mobileNumberExists(
    @Args('input') input: OtpInput
  ): Promise<MobileNumberExists> {
    let mobileNumberExists;
    try {
      const exists = await this.userService.mobileNumberExists(input);
      mobileNumberExists = exists.length > 0 && exists[0].mobileNumber;
      return {
        success: mobileNumberExists ? 1 : 0,
        message: mobileNumberExists
          ? 'Mobile number exists.'
          : 'Mobile number does not exist.',
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        mobileNumberExists ? 'Mobile number does not exists' : error.message
      );
    }
  }

  @Mutation(() => OtpResponse)
  async verifyOtp(@Args('input') input: VerifyOtpInput): Promise<OtpResponse> {
    try {
      const { email, isOtpValid } = await this.userService.verifyOtp(input);
      return {
        success: isOtpValid ? 1 : 0,
        message: isOtpValid ? 'Otp Valid.' : 'Otp not Valid.',
        email: isOtpValid ? email : '',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Mutation(() => OtpSendResponse)
  async sendOtp(@Args('input') input: OtpInput) {
    try {
      const success = await this.userService.sendOtp(input);
      return {
        success: success ? 1 : 0,
        message: success
          ? 'Otp sent successfully.'
          : 'Technical issue please try again.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Mutation(() => OtpLoginResponse)
  async verifyOtpLogin(@Args('input') input: VerifyOtpInput) {
    try {
      const { isOtpValid, data } = await this.userService.verifyOtpLogin(input);
      return {
        success: isOtpValid ? 1 : 0,
        message: isOtpValid ? 'Otp verify Successful' : 'Otp is incorrect',
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
