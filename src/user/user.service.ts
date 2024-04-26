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
            "deviceGroupIdObj": { $toObjectId: "$deviceGroupId" }
          }
        },
        {
          $lookup: {
            from: "devicegroups",
            localField: "deviceGroupIdObj",
            foreignField: "_id",
            as: "deviceGroup"
          }
        },
        {
          $unwind: {
            path: '$deviceGroup',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: "assertassingmentmoduleentities",
            localField: "deviceGroup.imeiData",
            foreignField: "_id",
            as: "imeiData"
          }
        },
        {
          $lookup: {
            from: "journeys",
            localField: "deviceGroup.imeiData.journey",
            foreignField: "_id",
            as: "journeyData"
          }
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
            deviceGroup: {
              _id: "$deviceGroup._id",
              deviceGroupName: "$deviceGroup.deviceGroupName",
              createdBy: "$deviceGroup.createdBy",
              updateBy: "$deviceGroup.updateBy",
              imeiData: {
                $map: {
                  input: "$imeiData",
                  as: "imei",
                  in: {
                    imei: "$$imei.imei",
                    labelName: "$$imei.labelName",
                    boxSet: "$$imei.boxSet",
                    journey:"$$imei.journey",
                    _id: "$$imei._id"
                  }
                }
              }
            }
          }
        },
        {
          $group: {
            _id: "$_id",
            firstName: { $first: "$firstName" },
            lastName: { $first: "$lastName" },
            userName: { $first: "$userName" },
            email: { $first: "$email" },
            mobileNumber: { $first: "$mobileNumber" },
            createdBy: { $first: "$createdBy" },
            roleId: { $first: "$roleId" },
            status: { $first: "$status" },
            deviceGroup: { $first: "$deviceGroup" }
          }
        }
      ];
  
      const result = await this.UserModel.aggregate(pipeline).skip(skip).limit(limit).exec();
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
        exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 1-hour Token Expiry By default
      },
      process.env.JWT_TOKEN_KEY
    );
  }

  async update(payload: UpdateUserInput) {
    try {
      const getUser=await this.UserModel.findById(payload._id);
      const updatePayload = {
        ...payload,
        password:getUser.password,
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
}
