import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Trip, TripSchema } from './entity/trip-module.entity';
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

  private calculateSkip(page: number, limit: number) {
    return page === -1 ? 0 : (page - 1) * limit;
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

  async create(payload: CreateTripInput) {
    try {
      const tripModel = await this.getTenantModel<Trip>(
        payload.accountId,
        Trip.name,
        TripSchema
      );

      const tripId = generateTripID();
      const record = await tripModel.create({
        ...payload,
        tripId,
      });
      return { record, tripId };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(input: TripInput) {
    try {
      const tripModel = await this.getTenantModel<Trip>(
        input.accountId,
        Trip.name,
        TripSchema
      );

      const { page, limit } = input;
      const skip = this.calculateSkip(Number(page), Number(limit));

      const records = await tripModel
        .find({})
        .skip(skip)
        .limit(Number(limit))
        .lean()
        .exec();
      console.log({ records });
      const count = await tripModel.countDocuments();
      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async searchTrip(input: SearchTripInput) {
    try {
      const tripModel = await this.getTenantModel<Trip>(
        input.accountId,
        Trip.name,
        TripSchema
      );

      const { page, limit, search } = input;
      const skip = this.calculateSkip(Number(page), Number(limit));
      const query = this.buildSearchQuery(search);

      const records = await tripModel
        .find(query)
        .skip(skip)
        .limit(Number(limit))
        .lean()
        .exec();

      const count = await tripModel.countDocuments(query);

      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(payload: UpdateTripInput) {
    try {
      const tripModel = await this.getTenantModel<Trip>(
        payload.accountId,
        Trip.name,
        TripSchema
      );

      const updatePayload = {
        ...payload,
        lastUpdated: new Date(),
      };
      const record = await tripModel
        .findByIdAndUpdate(payload._id, updatePayload, { new: true })
        .exec();
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
