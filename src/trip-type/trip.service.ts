import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { TripType, TripTypeSchema } from './entites/trip-type.entity';
import {
  CreateTripTypeInput,
  SearchTripTypeInput,
  TripTypeInput,
} from './dto/create-trip-type.input';
import { UpdateTripTypeInput } from './dto/update-trip-type';

@Injectable()
export class TripTypeService {
  constructor(
    @InjectConnection()
    private connection: Connection
  ) {}

  async getTenantModel<T>(
    tenantId: string | undefined,
    modelName: string,
    schema: any
  ): Promise<Model<T> | null> {
    if (!tenantId || !tenantId.trim()) {
      return null;
    }
    const tenantConnection = this.connection.useDb(
      `tenant_${tenantId.trim()}`,
      { useCache: true }
    );
    return tenantConnection.model(modelName, schema);
  }

  async findAll(input: TripTypeInput) {
    try {
      const tripTypeModel = await this.getTenantModel<TripType>(
        input.accountId,
        TripType.name,
        TripTypeSchema
      );

      if (!tripTypeModel) {
        return { records: [], count: 0 }; // return empty results or handle as needed
      }
      const { page, limit } = input;
      const skip = this.calculateSkip(Number(page), Number(limit));

      const records = await tripTypeModel
        .find({})
        .skip(skip)
        .limit(Number(limit))
        .lean()
        .exec();

      const count = await tripTypeModel.count().lean().exec();

      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private calculateSkip(page: number, limit: number) {
    return page === -1 ? 0 : (page - 1) * limit;
  }

  async create(payload: CreateTripTypeInput) {
    const tripTypeModel = await this.getTenantModel<TripType>(
      payload.accountId,
      TripType.name,
      TripTypeSchema
    );
    if (!tripTypeModel) {
      return null; // or handle the case as needed
    }
    const record = tripTypeModel.create({
      ...payload,
    });
    return record;
  }

  async searchIndustry(input: SearchTripTypeInput) {
    try {
      const tripTypeModel = await this.getTenantModel<TripType>(
        input.accountId,
        TripType.name,
        TripTypeSchema
      );
      if (!tripTypeModel) {
        return { records: [], count: 0 }; // return empty results or handle as needed
      }
      const { page, limit, search } = input;
      const skip = this.calculateSkip(Number(page), Number(limit));
      const query = this.buildSearchQuery(search);

      const records = await tripTypeModel
        .find(query)
        .skip(skip)
        .limit(Number(limit))
        .lean()
        .exec();

      const count = await tripTypeModel.countDocuments(query);

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
      const tripTypeModel = await this.getTenantModel<TripType>(
        payload.accountId,
        TripType.name,
        TripTypeSchema
      );
      if (!tripTypeModel) {
        return null; // or handle the case as needed
      }
      const record = await tripTypeModel
        .findByIdAndUpdate(payload._id, updatePayload, { new: true })
        .exec();
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
