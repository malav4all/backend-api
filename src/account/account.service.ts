/* eslint-disable */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Role, RoleDocument } from '../role/entities/role.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Account, AccountDocument } from './enities/account-module.enitiy';
import {
  AccountInput,
  CreateAccountInput,
  SearchAccountInput,
} from './dto/create-account-module.input';
import { UpdateAccountInput } from './dto/update.account-module';
import { TenantsService } from '@imz/tenants/tenants.service';
import { generateShortUuid, generateUniqueID } from '@imz/helper/generateotp';
import { InfluxdbService } from '@imz/influx-db/influx-db-.service';
import { UserService } from '@imz/user/user.service';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name)
    private AccountModel: Model<AccountDocument>,
    @InjectModel(Role.name) private RoleModel: Model<RoleDocument>,
    private tenantService: TenantsService,
    private influxDbService: InfluxdbService,
    private userService: UserService
  ) {}

  async findAll(input: AccountInput, loggedInUser: any) {
    try {
      const getUser = await this.userService.fetchUserByUserId(
        loggedInUser.userId?.toString()
      );
      const user = getUser[0];
      const isSuperAdmin = user?.isSuperAdmin || false;
      const isAccountAdmin = user?.isAccountAdmin || false;
      const accountId = user?.accountId;

      let filter = {};

      if (isSuperAdmin) {
        filter = {};
      } else if (isAccountAdmin) {
        filter = { accountId: accountId };
      } else {
        filter = { accountId: accountId };
      }

      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      // Aggregation pipeline to fetch accounts with device onboarding count
      const aggregatedRecords = await this.AccountModel.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'deviceonboardings', // Collection to join
            localField: 'accountId', // Field in AccountModel (source collection)
            foreignField: 'accountId', // Field in deviceonboardings (target collection)
            as: 'deviceOnboardings', // Alias for the joined collection
          },
        },
        {
          $addFields: {
            deviceOnboardingIMEINumberCount: {
              $size: {
                $filter: {
                  input: '$deviceOnboardings',
                  as: 'deviceOnboarding',
                  cond: {
                    $ne: [
                      '$$deviceOnboarding.deviceOnboardingIMEINumber',
                      null,
                    ],
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            deviceOnboardings: 0, // Exclude the joined array if not needed
          },
        },
        { $skip: skip },
        { $limit: limit },
      ]).exec();

      // Convert the aggregation results into a format mongoose can use for population
      const records = await this.AccountModel.populate(aggregatedRecords, {
        path: 'industryType',
      });

      // Count the total number of records based on the same filter
      const count = await this.AccountModel.countDocuments(filter).exec();

      return { count, records };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async create(payload: CreateAccountInput, getLoggedInUserDetail: any) {
    const uniqueInfluxBucketName = generateUniqueID('IMZ');
    let accountPayload;

    accountPayload = {
      ...payload,
      accountId: uniqueInfluxBucketName,
      tenantId: uniqueInfluxBucketName,
    };

    const record = await this.AccountModel.create(accountPayload);
    await this.influxDbService.createBucket(uniqueInfluxBucketName);
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

  async getAccountDetailId(payload: any) {
    try {
      const record = await this.AccountModel.findOne({
        accountId: payload.accountId,
      }).exec();

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
          { accountId: { $regex: input.search, $options: 'i' } },
          { accountContactMobile: { $regex: input.search, $options: 'i' } },
          { accountName: { $regex: input.search, $options: 'i' } },
          { accountContactEmail: { $regex: input.search, $options: 'i' } },
        ],
      })
        .populate('industryType')
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
