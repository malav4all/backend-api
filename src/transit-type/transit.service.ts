import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TransitType,
  TransitTypeDocument,
} from './entites/transit-type.entity';
import {
  CreateTransitTypeInput,
  SearchTransitTypeInput,
  TransitTypeInput,
} from './dto/create-transit-type.input';
import { UpdateTransitTypeInput } from './dto/update-transit-type';

@Injectable()
export class TransitTypeService {
  constructor(
    @InjectModel(TransitType.name)
    private TransitTypeModel: Model<TransitTypeDocument>
  ) {}

  async count() {
    return await this.TransitTypeModel.count().exec();
  }

  async findAll(input: TransitTypeInput) {
    try {
      const { page, limit } = input;
      const skip = this.calculateSkip(Number(page), Number(limit));

      const records = await this.TransitTypeModel.find({})
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

  async create(payload: CreateTransitTypeInput) {
    const record = this.TransitTypeModel.create({
      ...payload,
    });
    return record;
  }

  async searchIndustry(input: SearchTransitTypeInput) {
    try {
      const { page, limit, search } = input;
      const skip = this.calculateSkip(Number(page), Number(limit));
      const query = this.buildSearchQuery(search);

      const records = await this.TransitTypeModel.find(query)
        .skip(skip)
        .limit(Number(limit))
        .lean()
        .exec();

      const count = await this.TransitTypeModel.countDocuments(query);

      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private buildSearchQuery(search: string) {
    return search
      ? {
          $or: [
            { transitName: { $regex: search, $options: 'i' } },
            { tripRate: { $regex: search, $options: 'i' } },
            { minBatteryPercentage: { $regex: search, $options: 'i' } },
          ],
        }
      : { isDelete: false };
  }

  async update(payload: UpdateTransitTypeInput) {
    try {
      const updatePayload = {
        ...payload,
        lastUpdated: new Date(),
      };
      const record = await this.TransitTypeModel.findByIdAndUpdate(
        payload._id,
        updatePayload,
        { new: true }
      ).exec();
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
