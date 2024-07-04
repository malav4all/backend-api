import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  LoginActivityFetchInput,
  LoginActivityInput,
  LogoutInput,
  SearchLoginActivityInput,
} from './dto/login-activity.input';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  LoginActivity,
  LoginActivityDocument,
} from './entity/login-activity.entity';

@Injectable()
export class LoginActivityService {
  constructor(
    @InjectModel(LoginActivity.name)
    private LoginActivityModel: Model<LoginActivityDocument>
  ) {}

  async createLoginActivity(payload: LoginActivityInput) {
    try {
      const record = await this.LoginActivityModel.create({
        ...payload,
      });
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(input: LoginActivityFetchInput) {
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const records = await this.LoginActivityModel.find()
        .limit(limit)
        .skip(skip)
        .lean()
        .sort({ _id: -1 })
        .exec();

      const count = await this.LoginActivityModel.count().exec();

      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async logout(payload: LogoutInput): Promise<boolean> {
    const userId = payload._id;
    try {
      const latestLoginActivity = await this.LoginActivityModel.findOne({
        userId: userId,
      }).sort({ loginTime: -1 });

      if (latestLoginActivity) {
        latestLoginActivity.logoutTime = new Date();
        await latestLoginActivity.save();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async searchLoginActivity(input: SearchLoginActivityInput) {
    try {
      const { page, limit, search } = input;

      const skip = this.calculateSkip(Number(page), Number(limit));
      const query = this.buildSearchQuery(search);
      const records = await this.LoginActivityModel.find(query)
        .skip(skip)
        .limit(Number(limit))
        .lean()
        .exec();
      const count = await this.LoginActivityModel.countDocuments(query);

      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private calculateSkip(page: number, limit: number) {
    return page === -1 ? 0 : (page - 1) * limit;
  }

  private buildSearchQuery(search: string) {
    return search ? { $and: [{ $text: { $search: search } }] } : {};
  }
}
