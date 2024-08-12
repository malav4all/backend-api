/* eslint-disable */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  CreateRoleInput,
  RoleInput,
  SearchRolesInput,
  checkRoleInput,
} from './dto/create-role.input';
import { RoleDocument, Role } from './entities/role.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateRoleInput } from './dto/update-role.input';
import { UserService } from '@imz/user/user.service';
import { AccountService } from '@imz/account/account.service';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name) private RoleModel: Model<RoleDocument>,
    private userService: UserService,
    private accountService: AccountService
  ) {}

  async count() {
    return await this.RoleModel.count({ isDelete: false }).exec();
  }

  async findAll(input: RoleInput, loggedInUser: any) {
    try {
      const getUser = await this.userService.fetchUserByUserId(
        loggedInUser.userId.toString()
      );

      // Assuming getUser returns an array and you need the first user
      const user = getUser[0];

      const isAccountAdmin = user.isAccountAdmin || false;
      const isSuperAdmin = user.isSuperAdmin || false;

      let filter: any = {};

      // If the user is an Account Admin but not a Super Admin, apply filtering
      if (isAccountAdmin && !isSuperAdmin) {
        const accountId = user.accountId.toString();

        // Fetch the account to get the industryType
        const account = await this.accountService.getAccountDetailId({
          accountId,
        });

        if (account && account.industryType) {
          filter = { industryType: account.industryType.toString() };
        }
      }

      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const record = await this.RoleModel.find(filter)
        .populate('industryType')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async create(payload: CreateRoleInput) {
    const record = await this.RoleModel.create(payload);
    return record;
  }

  async update(payload: UpdateRoleInput) {
    try {
      const updatePayload = {
        ...payload,
        lastUpdated: new Date(),
      };
      const record = await this.RoleModel.findByIdAndUpdate(
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

  async softDelete(payload: UpdateRoleInput) {
    try {
      const updatePayload = {
        ...payload,
        isDelete: true,
        lastUpdated: new Date(),
      };
      const record = await this.RoleModel.findByIdAndUpdate(
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

  async searchRoles(input: SearchRolesInput) {
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;
      const query = {
        $and: [
          { isDelete: false },
          {
            $or: [
              { name: { $regex: input.search, $options: 'i' } },
              { description: { $regex: input.search, $options: 'i' } },
              { 'industryType.name': { $regex: input.search, $options: 'i' } },
            ],
          },
        ],
      };
      const records = await this.RoleModel.find(query)
        .populate('industryType')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      const count = await this.RoleModel.countDocuments(query);

      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async checkExistsRecord(payload: checkRoleInput) {
    try {
      const cleanedName = payload.name.trim(); // Trim leading and trailing spaces
      const record = await this.RoleModel.find({
        name: new RegExp(`^${cleanedName}$`, 'i'),
      })
        .lean()
        .exec();

      if (record.length === 0) {
        return undefined;
      }

      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
