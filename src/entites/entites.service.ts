import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import {
  CreateEntitesInput,
  EntitesTypeInput,
  SearchEntitesInput,
} from './dto/create-entites.input';
import { Entites, EntitesSchema } from './entity/entites.type';

@Injectable()
export class EntitesService {
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

  async create(payload: CreateEntitesInput) {
    try {
      const tenantModel = await this.getTenantModel<Entites>(
        payload.accountId,
        Entites.name,
        EntitesSchema
      );

      const existingRecord = await tenantModel.findOne({
        name: payload.name,
      });
      if (existingRecord) {
        throw new Error('Record Already Exits');
      }

      const record = await tenantModel.create({
        ...payload,
      });
      return record;
    } catch (error) {
      throw new Error(`Failed to create : ${error.message}`);
    }
  }

  async findAll(input: EntitesTypeInput) {
    try {
      const tenantModel = await this.getTenantModel<Entites>(
        input.accountId,
        Entites.name,
        EntitesSchema
      );

      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const records = await tenantModel
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      const count = await tenantModel.count().exec();
      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async fetchEntityByTripTypeAndType(input: EntitesTypeInput) {
    try {
      const tenantModel = await this.getTenantModel<Entites>(
        input.accountId,
        Entites.name,
        EntitesSchema
      );

      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;
      const query: any = {};
      if (input.type) {
        query.type = input.type;
      }
      if (input.tripTypeList && input.tripTypeList.length > 0) {
        query.tripTypeList = { $in: input.tripTypeList };
      }

      const records = await tenantModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      const count = await tenantModel.countDocuments(query).exec();

      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async searchLocations(input: SearchEntitesInput) {
    try {
      const tenantModel = await this.getTenantModel<Entites>(
        input.accountId,
        Entites.name,
        EntitesSchema
      );

      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const records = await tenantModel
        .find({
          $or: [{ type: { $regex: input.search, $options: 'i' } }],
        })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      const count = await tenantModel.countDocuments({
        $or: [{ type: { $regex: input.search, $options: 'i' } }],
      });
      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
