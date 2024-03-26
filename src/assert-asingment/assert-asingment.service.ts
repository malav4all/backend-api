import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AssertAssingmentModuleInput,
  CheckAssertAssingmentModuleInput,
  CreateAssertAssingmentModuleInput,
  SearchAssertAssingmentModuleInput,
} from './dto/create-assert-asingment.input';
import { UpdateAssertAssingmentModuleInput } from './dto/update.assert-asingment';
import {
  AssertAssingmentModuleEntity,
  AssertAssingmentModuleDocument,
} from './entities/assert-asingment.enitiy';

@Injectable()
export class AssertAssingmentModuleService {
  constructor(
    @InjectModel(AssertAssingmentModuleEntity.name)
    private AssertAssingmentModuleModule: Model<AssertAssingmentModuleDocument>
  ) {}

  async count() {
    return await this.AssertAssingmentModuleModule.count().exec();
  }

  async findAll(input: AssertAssingmentModuleInput) {
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);

      const skip = page === -1 ? 0 : (page - 1) * limit;
      const records = await this.AssertAssingmentModuleModule.find()
        .populate('journey')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
      return records;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async create(payload: CreateAssertAssingmentModuleInput) {
    try {
      const record = await this.AssertAssingmentModuleModule.create(payload);
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(payload: UpdateAssertAssingmentModuleInput) {
    try {
      const updatePayload = {
        ...payload,
        lastUpdated: new Date(),
      };
      const record = await this.AssertAssingmentModuleModule.findByIdAndUpdate(
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

  async softDelete(payload: UpdateAssertAssingmentModuleInput) {
    try {
      const updatePayload = {
        ...payload,
        isDelete: true,
        lastUpdated: new Date(),
      };
      const record = await this.AssertAssingmentModuleModule.findByIdAndUpdate(
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

  async searchAssertAssingmentModel(input: SearchAssertAssingmentModuleInput) {
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const records = await this.AssertAssingmentModuleModule.find({
        $or: [{ imei: { $regex: input.search, $options: 'i' } }],
      })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      const count = await this.AssertAssingmentModuleModule.countDocuments({
        $or: [{ imei: { $regex: input.search, $options: 'i' } }],
      });

      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async checkExistsRecord(payload: CheckAssertAssingmentModuleInput) {
    try {
      const record = await this.AssertAssingmentModuleModule.find({
        imei: {
          $in: [payload.imei],
        },
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

  async bulkJourneyUpload(payload: CreateAssertAssingmentModuleInput[]) {
    try {
      const record = await this.AssertAssingmentModuleModule.insertMany(
        payload
      );
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
