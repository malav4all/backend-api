import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trip, TripDocument } from './entity/trip-module.entity';
import {
  CreateTripInput,
  SearchTripInput,
  TripInput,
} from './dto/create-trip-module.input';
import { UpdateTripInput } from './dto/update-trip-module.update';
import { generateTripID } from '@imz/helper/generateotp';

@Injectable()
export class TripService {
  constructor(
    @InjectModel(Trip.name)
    private TripModel: Model<TripDocument>
  ) {}

  async count() {
    return await this.TripModel.count().exec();
  }

  async findAll(input: TripInput) {
    try {
      const { page, limit } = input;
      const skip = this.calculateSkip(Number(page), Number(limit));

      const records = await this.TripModel.find({})
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

  async create(payload: CreateTripInput) {
    const tripId = generateTripID();
    const record = this.TripModel.create({
      ...payload,
      tripId,
    });
    return { record, tripId };
  }

  async searchTrip(input: SearchTripInput) {
    try {
      const { page, limit, search } = input;
      const skip = this.calculateSkip(Number(page), Number(limit));
      const query = this.buildSearchQuery(search);

      const records = await this.TripModel.find(query)
        .skip(skip)
        .limit(Number(limit))
        .lean()
        .exec();

      const count = await this.TripModel.countDocuments(query);

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

  async update(payload: UpdateTripInput) {
    try {
      const updatePayload = {
        ...payload,
        lastUpdated: new Date(),
      };
      const record = await this.TripModel.findByIdAndUpdate(
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
