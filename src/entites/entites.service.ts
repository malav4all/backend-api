import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import {
  CreateEntitesInput,
  EntitesTypeInput,
  SearchEntitesInput,
} from './dto/create-entites.input';
import { Entites, EntitesSchema } from './entity/entites.type';
import { UpdateEntitesInput } from './dto/update.entites.input';

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

  async searchEntity(input: SearchEntitesInput) {
    try {
      const tenantModel = await this.getTenantModel<Entites>(
        input.accountId,
        Entites.name,
        EntitesSchema
      );
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const searchCriteria = {
        $or: [
          { createdBy: { $regex: input.search, $options: 'i' } },
          { aadharCardNo: { $regex: input.search, $options: 'i' } },
          { gstIn: { $regex: input.search, $options: 'i' } },
          { contactPhone: { $regex: input.search, $options: 'i' } },
          { contactEmail: { $regex: input.search, $options: 'i' } },
          { contactName: { $regex: input.search, $options: 'i' } },
          { pinCode: { $regex: input.search, $options: 'i' } },
          { district: { $regex: input.search, $options: 'i' } },
          { area: { $regex: input.search, $options: 'i' } },
          { state: { $regex: input.search, $options: 'i' } },
          { city: { $regex: input.search, $options: 'i' } },
          { address: { $regex: input.search, $options: 'i' } },
          { type: { $regex: input.search, $options: 'i' } },
          { name: { $regex: input.search, $options: 'i' } },
          { tripTypeList: { $regex: input.search, $options: 'i' } },
          { accountId: { $regex: input.search, $options: 'i' } },
          { updatedBy: { $regex: input.search, $options: 'i' } },
        ],
      };

      const records = await tenantModel
        .find(searchCriteria)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      const count = await tenantModel.countDocuments(searchCriteria);

      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(payload: UpdateEntitesInput) {
    try {
      const updatePayload = {
        ...payload,
        lastUpdated: new Date(),
      };
      const tenantModel = await this.getTenantModel<Entites>(
        payload.accountId,
        Entites.name,
        EntitesSchema
      );
      if (!tenantModel) {
        return null;
      }
      const record = await tenantModel
        .findByIdAndUpdate(payload._id, updatePayload, { new: true })
        .exec();
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
