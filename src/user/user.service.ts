import { Inject, Injectable, Logger } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import {
  CreateUserInput,
  LoginUserInput,
  ChangePasswordInput,
  UserInput,
  SearchUsersInput,
} from './dto/create-user.input';
import axios from 'axios';
import { UpdateUserInput } from './dto/update-user.input';
import { UserDocument, User } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EncodeDecode } from '@imz/helper';
import * as jwt from 'jsonwebtoken';
import { UAParser } from 'ua-parser-js';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class UserService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectModel(User.name)
    private UserModel: Model<UserDocument>
  ) {}

  logger = new Logger('UserService');

  async findAll(input: UserInput) {
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const records = await this.UserModel.find({})
        .skip(skip)
        .limit(limit)
        .exec();
      const count = await this.UserModel.count().exec();
      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async create(payload: CreateUserInput) {
    try {
      const existingUser = await this.UserModel.findOne({
        email: payload.email,
      });
      if (existingUser) {
        this.logger.error('User Email already Exits');
        throw new Error('User with this email already exists');
      }

      const password = await EncodeDecode.encrypt(
        payload.password,
        payload.email
      );

      const record = await this.UserModel.create({
        ...payload,
        password: password,
      });
      return record;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async change(payload: ChangePasswordInput) {
    try {
      const existingUser = await this.findUserByEmail(payload.email);

      if (!existingUser) {
        throw new Error('User not found');
      }
      const newPassword = await EncodeDecode.encrypt(
        payload.password,
        payload.email
      );
      const updateResult = await this.updateUserPassword(
        existingUser._id,
        newPassword
      );
      return updateResult;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private async findUserByEmail(email: string) {
    return await this.UserModel.findOne({ email }).select('_id').lean();
  }

  private async updateUserPassword(userId: string, newPassword: string) {
    return await this.UserModel.updateOne(
      { _id: userId },
      { password: newPassword }
    );
  }

  async login(payload: LoginUserInput) {
    const inputUser: any = payload;
    try {
      let user: any = await this.UserModel.findOne({
        email: inputUser.email,
      })
        .lean()
        .exec();

      if (user) {
        const isPasswordValid = await this.verifyPassword(
          user,
          inputUser.password
        );
        if (isPasswordValid) {
          const accessToken = await this.generateAccessToken(user);
          user = {
            _id: user._id,
            accessToken,
            name: user.firstName,
            email: user.email,
            roleId: user.roleId,
          };
          this.logger.verbose(`User Login Successfully:::${user.name}`);
          return {
            data: { user },
            success: 1,
            message: `Welcome ${user.name}`,
          };
        } else {
          this.logger.error('Please enter the correct password!');
          return {
            success: 0,
            message: 'Please enter the correct password!',
          };
        }
      } else {
        this.logger.error('User does not exist in our records');
        return {
          success: 0,
          message: 'User does not exist in our records',
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private async verifyPassword(
    user: any,
    inputPassword: string
  ): Promise<boolean> {
    const decryptedPassword = await EncodeDecode.decrypt(
      user.password,
      user.email
    );
    return decryptedPassword === inputPassword;
  }

  async refreshToken(refreshToken: string) {
    try {
      const refreshTokenPayload = await jwt.decode(refreshToken);
      const newAccessToken = await this.generateAccessToken(
        refreshTokenPayload
      );
      this.logger.verbose('Refresh Token Generate Successful');
      return {
        accessToken: newAccessToken,
        success: 1,
        message: 'Access token refreshed successfully',
      };
    } catch (error) {
      this.logger.verbose(error.message);
      throw new Error(error.message);
    }
  }

  private async generateAccessToken(user: any) {
    return jwt.sign(
      {
        email: user.email,
        _id: user._id,
        // exp: Math.floor(Date.now() / 1000) + 10,
        exp: Math.floor(Date.now() / 1000) + 1 * 60 * 60, // 1-hour Token Expiry By default
      },
      process.env.JWT_TOKEN_KEY
    );
  }

  async update(payload: UpdateUserInput) {
    try {
      const updatePayload = {
        ...payload,
        updatedAt: new Date(),
      };
      const record = await this.UserModel.findByIdAndUpdate(
        payload._id,
        updatePayload,
        {
          new: true,
        }
      )
        .lean()
        .exec();
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async softDelete(payload: UpdateUserInput) {
    try {
      const updatePayload = {
        ...payload,
        active: true,
        updatedAt: new Date(),
      };
      const record = await this.UserModel.findByIdAndUpdate(
        payload._id,
        updatePayload,
        {
          new: true,
        }
      )
        .lean()
        .exec();
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async searchUsers(input: SearchUsersInput) {
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const records = await this.UserModel.find({
        $or: [
          { firstName: { $regex: input.search, $options: 'i' } },
          { email: { $regex: input.search, $options: 'i' } },
          { roleId: { $regex: input.search, $options: 'i' } },
          { mobileNumber: { $regex: input.search, $options: 'i' } },
          { createdBy: { $regex: input.search, $options: 'i' } },
        ],
      })
        .skip(skip)
        .limit(limit)
        .populate([{ path: 'roleId' }])
        .lean()
        .exec();

      const count = await this.UserModel.countDocuments({
        $or: [
          { firstName: { $regex: input.search, $options: 'i' } },
          { email: { $regex: input.search, $options: 'i' } },
          { roleId: { $regex: input.search, $options: 'i' } },
          { mobileNumber: { $regex: input.search, $options: 'i' } },
          { createdBy: { $regex: input.search, $options: 'i' } },
        ],
      });
      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async filterByAccountId(accountId: string) {
    try {
      const user = await this.UserModel.find({ accountId }).exec();
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
