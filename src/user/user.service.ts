import { Inject, Injectable, Logger } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import {
  CreateUserInput,
  LoginUserInput,
  ChangePasswordInput,
  UserInput,
  SearchUsersInput,
  OtpInput,
  VerifyOtpInput,
  AccountIdInput,
} from './dto/create-user.input';
import axios from 'axios';
import { UpdateUserInput } from './dto/update-user.input';
import { UserDocument, User } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EncodeDecode } from '@imz/helper';
import * as jwt from 'jsonwebtoken';
import { UAParser } from 'ua-parser-js';
import { REQUEST } from '@nestjs/core';
import { generateOtp } from '@imz/helper/generateotp';
@Injectable()
export class UserService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectModel(User.name)
    private UserModel: Model<UserDocument>
  ) {}
  otpStorage: Record<string, { otp: string; timestamp: number }> = {};
  logger = new Logger('UserService');

  async findAll(input: UserInput) {
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const pipeline = [
        {
          $addFields: {
            roleId: { $toObjectId: '$roleId' },
          },
        },
        {
          $lookup: {
            from: 'roles', // The collection to join with
            localField: 'roleId', // The local field in the users collection
            foreignField: '_id', // The foreign field in the roles collection
            as: 'roleDetails', // The name for the new array field
          },
        },
        {
          $unwind: '$roleDetails', // Unwind the array to get an object
        },
        {
          $lookup: {
            from: 'accounts', // The collection to join with
            localField: 'accountId', // The local field in the users collection
            foreignField: 'accountId', // The foreign field in the accounts collection
            as: 'accountDetails', // The name for the new array field
          },
        },
        {
          $unwind: '$accountDetails', // Unwind the array to get an object
        },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            userName: 1,
            email: 1,
            mobileNumber: 1,
            createdBy: 1,
            roleId: 1,
            status: 1,
            'roleDetails.name': 1, // Include the role name
            'accountDetails._id': 1, // Include the account ID
            'accountDetails.accountName': 1, // Include the account name
          },
        },
        {
          $group: {
            _id: '$_id',
            firstName: { $first: '$firstName' },
            lastName: { $first: '$lastName' },
            userName: { $first: '$userName' },
            email: { $first: '$email' },
            mobileNumber: { $first: '$mobileNumber' },
            createdBy: { $first: '$createdBy' },
            roleId: { $first: '$roleId' },
            status: { $first: '$status' },
            roleName: { $first: '$roleDetails.name' }, // Add the role name
            accountId: { $first: '$accountDetails._id' }, // Add the account ID
            accountName: { $first: '$accountDetails.accountName' }, // Add the account name
          },
        },
      ];

      const result = await this.UserModel.aggregate(pipeline)
        .skip(skip)
        .limit(limit)
        .exec();

      const count = await this.UserModel.countDocuments().exec();

      return { records: result, count };
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

  public async getAllUserCount() {
    return await this.UserModel.count();
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
        .populate([{ path: 'accountId' }, { path: 'roleId' }])
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
            account: user.accountId,
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
        accountId: user.accountId,
        roleId: user.roleId,
        // exp: Math.floor(Date.now() / 1000) + 10,
        exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 1-hour Token Expiry By default
      },
      process.env.JWT_TOKEN_KEY
    );
  }

  async update(payload: UpdateUserInput) {
    try {
      const getUser = await this.UserModel.findById(payload._id);
      const updatePayload = {
        ...payload,
        password: getUser.password,
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

      const searchCriteria = input.search
        ? {
            $or: [
              { firstName: { $regex: input.search, $options: 'i' } },
              { email: { $regex: input.search, $options: 'i' } },
              { mobileNumber: { $regex: input.search, $options: 'i' } },
              { createdBy: { $regex: input.search, $options: 'i' } },
              { 'roleDetails.name': { $regex: input.search, $options: 'i' } },
              {
                'accountDetails.accountName': {
                  $regex: input.search,
                  $options: 'i',
                },
              },
            ],
          }
        : {};

      const pipeline = [
        {
          $addFields: {
            roleId: { $toObjectId: '$roleId' },
          },
        },
        {
          $lookup: {
            from: 'roles',
            localField: 'roleId',
            foreignField: '_id',
            as: 'roleDetails',
          },
        },
        {
          $unwind: { path: '$roleDetails', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'accounts',
            localField: 'accountId',
            foreignField: 'accountId',
            as: 'accountDetails',
          },
        },
        {
          $unwind: {
            path: '$accountDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            roleName: '$roleDetails.name',
            accountName: '$accountDetails.accountName',
          },
        },
        {
          $match: searchCriteria,
        },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            userName: 1,
            email: 1,
            mobileNumber: 1,
            createdBy: 1,
            roleId: 1,
            status: 1,
            roleName: 1,
            accountId: 1,
            accountName: 1,
          },
        },
      ];

      const records = await this.UserModel.aggregate(pipeline)
        .skip(skip)
        .limit(limit)
        .exec();

      const countPipeline = [
        {
          $addFields: {
            roleId: { $toObjectId: '$roleId' },
            accountId: { $toObjectId: '$accountId' },
          },
        },
        {
          $lookup: {
            from: 'roles',
            localField: 'roleId',
            foreignField: '_id',
            as: 'roleDetails',
          },
        },
        {
          $unwind: { path: '$roleDetails', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'accounts',
            localField: 'accountId',
            foreignField: '_id',
            as: 'accountDetails',
          },
        },
        {
          $unwind: {
            path: '$accountDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            roleName: '$roleDetails.name',
            accountName: '$accountDetails.accountName',
          },
        },
        {
          $match: searchCriteria,
        },
        { $count: 'total' },
      ];

      const countResult = await this.UserModel.aggregate(countPipeline);
      const count = countResult[0]?.total || 0;

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

  async mobileNumberExists(payload: OtpInput): Promise<any> {
    try {
      const { mobileNumber } = payload;
      const user = await this.UserModel.find({ mobileNumber }).lean().exec();
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async sendOtp(payload: OtpInput) {
    try {
      const { mobileNumber } = payload;
      const otp = generateOtp();
      const response = await axios.get(process.env.URL, {
        params: {
          method: 'SendMessage',
          v: '1.1',
          auth_scheme: process.env.AUTH_SCHEME,
          msg_type: process.env.MSG_TYPE,
          format: process.env.FORMAT,
          msg: `IMZ - ${Number(
            otp
          )} is the One-Time Password (OTP) for login with IMZ`,
          send_to: Number(mobileNumber),
          userid: process.env.USERID,
          password: process.env.PASSWORD,
        },
        timeout: 120000,
      });

      await this.UserModel.updateOne(
        { mobileNumber },
        { $set: { otp } }
      ).exec();

      return {
        success: response.status >= 400 ? 0 : 1,
        message:
          response.status >= 400
            ? 'Failed to send OTP'
            : 'OTP sent successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async verifyOtp(
    payload: VerifyOtpInput
  ): Promise<{ isOtpValid: boolean; email: string }> {
    try {
      const { mobileNumber, otp } = payload;
      const user: any = await this.UserModel.findOne({ mobileNumber }).exec();
      if (user && user?.otp) {
        const storedOtp = user.otp;
        const isOtpValid = otp === storedOtp;
        if (isOtpValid) {
          await this.UserModel.updateOne(
            { mobileNumber },
            { $unset: { otp: 1 } }
          ).exec();
        }
        return { isOtpValid, email: user.email };
      }
      return { isOtpValid: false, email: '' };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async verifyOtpLogin(
    payload: VerifyOtpInput
  ): Promise<{ isOtpValid: boolean; data: any }> {
    try {
      const { mobileNumber, otp } = payload;
      // eslint-disable-next-line prefer-const
      let user: any = await this.UserModel.findOne({
        mobileNumber,
      })
        .populate([{ path: 'accountId' }, { path: 'roleId' }])
        .lean()
        .exec();

      if (user && user.otp) {
        const isOtpValid = otp === user.otp;

        if (isOtpValid) {
          const request: any = this.request;
          const ipInfo = request.req.ipInfo;
          const workstation = UAParser(request.req.headers['user-agent']);

          const accessToken = await this.generateAccessToken(user);
          const systemInfo = { ipInfo, workstation } as any;
          user = {
            _id: user._id,
            accessToken,
            name: user.firstName,
            email: user.email,
            account: user.accountId,
            roleId: user.roleId,
          };
          await this.UserModel.updateOne(
            { mobileNumber },
            { $unset: { otp: 1 } }
          ).exec();

          this.logger.verbose(`User Login Successfully:::${user.name}`);
          return { isOtpValid, data: user };
        }
      }

      return { isOtpValid: false, data: '' };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async fetchAccountIdUser(payload: AccountIdInput): Promise<any> {
    try {
      const { accountId } = payload;
      const user = await this.UserModel.find({ accountId }).lean().exec();
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
