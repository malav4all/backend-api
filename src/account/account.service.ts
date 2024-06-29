/* eslint-disable */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Role, RoleDocument } from '../role/entities/role.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Account,
  AccountDocument,
} from './enities/account-module.enitiy';
import {
  AccountInput,
  CreateAccountInput,
  SearchAccountInput,
} from './dto/create-account-module.input';
import { UpdateAccountInput } from './dto/update.account-module';
import { TenantsService } from '@imz/tenants/tenants.service';
import { generateShortUuid } from '@imz/helper/generateotp';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name)
    private AccountModel: Model<AccountDocument>,
    @InjectModel(Role.name) private RoleModel: Model<RoleDocument>,
    private tenantService: TenantsService
  ) {}

  async findAll(input: AccountInput, { accountId, roleId }) {
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);
      const loggedInUser = await this.AccountModel.findById(accountId)
        .populate('industryType')
        .exec();
      const loggedInUserRole = await this.RoleModel.findById(
        roleId._id.toString()
      ).exec();

      let query = {};

      if (loggedInUserRole.name === 'Master Admin') {
        query = {};
      } else if (loggedInUserRole.name === 'Super Admin') {
        if (loggedInUser.parentId === '') {
          query = {
            industryType: loggedInUser.industryType._id.toString(),
          };
        } else {
          query = { _id: loggedInUser._id };
        }
      } else {
        query = {
          $or: [{ _id: accountId._id }, { parentId: accountId._id }],
        };
      }
      const skip = page === -1 ? 0 : (page - 1) * limit;
      const records = await this.AccountModel.find(query)
        .populate('industryType')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
      const count = await this.AccountModel.count(query).exec();

      return { count, records };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async create(payload: CreateAccountInput, getLoggedInUserDetail: any) {
    let accountPayload;
    const getAccountDetail = await this.AccountModel.findById(
      getLoggedInUserDetail.accountId._id
    );

    const getRole =
      getLoggedInUserDetail.roleId.name === 'Super Admin' ||
      getLoggedInUserDetail.roleId.name === 'Master Admin';
    if (getRole) {
      accountPayload = {
        ...payload,
        nodeSequence: 0 + 1,
        tenantId: generateShortUuid(),
      };
    } else {
      accountPayload = {
        ...payload,
        nodeSequence: getAccountDetail.nodeSequence + 1,
        tenantId: generateShortUuid(),
      };
    }

    const record = await this.AccountModel.create(accountPayload);
    await this.tenantService.createTenant({
      accountId: record._id,
      accountName: payload.accountName,
      tenantId: record.tenantId,
    });
    return record;
  }

  async update(payload: UpdateAccountInput) {
    try {
      const updatePayload = {
        ...payload,
        lastUpdated: new Date(),
      };
      const record = await this.AccountModel.findByIdAndUpdate(
        payload._id,
        updatePayload,
        {
          new: true,
        }
      ).exec();
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async softDelete(payload: UpdateAccountInput) {
    try {
      const updatePayload = {
        ...payload,
        isDelete: true,
        lastUpdated: new Date(),
      };
      const record = await this.AccountModel.findByIdAndUpdate(
        payload._id,
        updatePayload,
        {
          new: true,
        }
      ).exec();
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async searchAccount(input: SearchAccountInput) {
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const records = await this.AccountModel.find({
        $or: [
          { accountName: { $regex: input.search, $options: 'i' } },
          { accountContactEmail: { $regex: input.search, $options: 'i' } },
        ],
      })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      const count = await this.AccountModel.countDocuments({
        $or: [{ accountName: { $regex: input.search, $options: 'i' } }],
      });

      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
