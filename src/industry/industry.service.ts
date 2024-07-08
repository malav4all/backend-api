import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateIndustryInput,
  IndustryInput,
  SearchIndustryInput,
  checkExitIndustryInput,
  fetchIndustryNameCodeInput,
} from './dto/create-industry.input';
import { Industry, IndustryDocument } from './entities/industry.entity';
import { UpdateIndustryInput } from './dto/update-industry.input';

@Injectable()
export class IndustryService {
  constructor(
    @InjectModel(Industry.name)
    private IndustryModel: Model<IndustryDocument>
  ) {}

  async count() {
    return await this.IndustryModel.count().exec();
  }

  async findAll(
    input: IndustryInput,
    { accountId, roleName }: { accountId: string; roleName: string }
  ) {
    try {
      const { page, limit } = input;
      const skip = this.calculateSkip(Number(page), Number(limit));

      const records = await this.IndustryModel.find({})
        .skip(skip)
        .limit(Number(limit))
        .lean()
        .exec();

      return records;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private calculateSkip(page: number, limit: number) {
    return page === -1 ? 0 : (page - 1) * limit;
  }

  private buildFindAllQuery(roleName: string, accountId: string) {
    if (roleName === 'Master Admin') {
      return {};
    } else if (roleName === 'Super Admin') {
      return { _id: accountId };
    } else {
      return { _id: accountId };
    }
  }

  async create(payload: CreateIndustryInput, fileName: string) {
    const record = this.IndustryModel.create({
      ...payload,
      file: fileName,
    });
    return record;
  }

  async searchIndustry(input: SearchIndustryInput) {
    try {
      const { page, limit, search } = input;
      const skip = this.calculateSkip(Number(page), Number(limit));
      const query = this.buildSearchQuery(search);

      const records = await this.IndustryModel.find(query)
        .skip(skip)
        .limit(Number(limit))
        .lean()
        .exec();

      const count = await this.IndustryModel.countDocuments(query);

      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private buildSearchQuery(search: string) {
    return search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { code: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        }
      : { isDelete: false };
  }

  async update(payload: UpdateIndustryInput) {
    try {
      const updatePayload = {
        ...payload,
        lastUpdated: new Date(),
      };
      const record = await this.IndustryModel.findByIdAndUpdate(
        payload._id,
        updatePayload,
        { new: true }
      ).exec();
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async checkExistsRecord(payload: checkExitIndustryInput) {
    try {
      const cleanedName = payload.name.trim();
      const record = await this.IndustryModel.find({
        name: new RegExp(`^${cleanedName}$`, 'i'),
      })
        .lean()
        .exec();

      return record.length === 0 ? undefined : record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getIndustryCodeRecord(payload: fetchIndustryNameCodeInput) {
    try {
      const record = await this.IndustryModel.findOne({ _id: payload._id })
        .lean()
        .exec();

      return record || undefined;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
