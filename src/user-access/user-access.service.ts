import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import {
  CreateUserAccessInput,
  SearchUserAccessInput,
  UserAccessInput,
} from './dto/create-user-access.input';
import { UserAccess, UserAccessSchema } from './entity/user-access.type';

@Injectable()
export class UserAccessService {
  constructor(
    @InjectConnection()
    private connection: Connection
  ) {}

  async getTenantModel<T>(
    tenantId: string,
    modelName: string,
    schema: any
  ): Promise<Model<T>> {
    const tenantConnection = await this.connection.useDb(`tenant_${tenantId}`);
    return tenantConnection.model(modelName, schema);
  }

  async create(payload: CreateUserAccessInput) {
    try {
      const tenantModel = await this.getTenantModel<UserAccess>(
        payload.accountId,
        UserAccess.name,
        UserAccessSchema
      );

      const existingRecord = await tenantModel.findOne({
        userId: payload.userId,
      });
      if (existingRecord) {
        throw new Error('Record Already Exits');
      }

      const record = await tenantModel.create({
        ...payload,
      });
      return record;
    } catch (error) {
      throw new Error(`Failed to create : ${error.message}`);
    }
  }

  async findAll(input: UserAccessInput) {
    try {
      const tenantModel = await this.getTenantModel<UserAccess>(
        input.accountId,
        UserAccess.name,
        UserAccessSchema
      );

      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const records = await tenantModel
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      const count = await tenantModel.count().exec();
      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async searchLocations(input: SearchUserAccessInput) {
    try {
      const tenantModel = await this.getTenantModel<UserAccess>(
        input.accountId,
        UserAccess.name,
        UserAccessSchema
      );

      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const records = await tenantModel
        .find({
          $or: [{ type: { $regex: input.search, $options: 'i' } }],
        })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      const count = await tenantModel.countDocuments({
        $or: [{ type: { $regex: input.search, $options: 'i' } }],
      });
      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
