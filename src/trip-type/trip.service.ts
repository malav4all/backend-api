import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TripType,
  TripTypeDocument,
} from './entites/trip-type.entity';
import {
  CreateTripTypeInput,
  SearchTripTypeInput,
  TripTypeInput,
} from './dto/create-trip-type.input';
import { UpdateTripTypeInput } from './dto/update-trip-type';

@Injectable()
export class TripTypeService {
  constructor(
    @InjectModel(TripType.name)
    private TripTypeModel: Model<TripTypeDocument>
  ) {}

  async count() {
    return await this.TripTypeModel.count().exec();
  }

  async findAll(input: TripTypeInput) {
    try {
      const { page, limit } = input;
      const skip = this.calculateSkip(Number(page), Number(limit));

      const records = await this.TripTypeModel.find({})
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

  async create(payload: CreateTripTypeInput) {
    const record = this.TripTypeModel.create({
      ...payload,
    });
    return record;
  }

  async searchIndustry(input: SearchTripTypeInput) {
    try {
      const { page, limit, search } = input;
      const skip = this.calculateSkip(Number(page), Number(limit));
      const query = this.buildSearchQuery(search);

      const records = await this.TripTypeModel.find(query)
        .skip(skip)
        .limit(Number(limit))
        .lean()
        .exec();

      const count = await this.TripTypeModel.countDocuments(query);

      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private buildSearchQuery(search: string) {
    return search
      ? {
          $or: [
            { tripName: { $regex: search, $options: 'i' } },
            { tripRate: { $regex: search, $options: 'i' } },
            { minBatteryPercentage: { $regex: search, $options: 'i' } },
          ],
        }
      : { isDelete: false };
  }

  async update(payload: UpdateTripTypeInput) {
    try {
      const updatePayload = {
        ...payload,
        lastUpdated: new Date(),
      };
      const record = await this.TripTypeModel.findByIdAndUpdate(
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
