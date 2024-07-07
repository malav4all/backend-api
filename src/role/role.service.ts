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

@Injectable()
export class RoleService {
  constructor(@InjectModel(Role.name) private RoleModel: Model<RoleDocument>) {}

  async count() {
    return await this.RoleModel.count({ isDelete: false }).exec();
  }

  async findAll(input: RoleInput, roleId: string) {
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const loggedInUserRole = await this.RoleModel.findById(roleId).populate(
        'industryType'
      );

      const record = await this.RoleModel.find({})
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
