import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { EntityType, EntityTypeSchema } from './entity/entity-type.entity';
import {
  CreateEntityTypeInput,
  EntityTypeInput,
  SearchEntityInput,
} from './dto/create-entity-type.input';

@Injectable()
export class EntityTypeService {
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
      console.warn(
        'Tenant ID is undefined or empty, skipping tenant-specific model creation'
      );
      return null;
    }
    const tenantConnection = await this.connection.useDb(
      `tenant_${tenantId.trim()}`,
      { useCache: true }
    );
    return tenantConnection.model(modelName, schema);
  }

  async create(payload: CreateEntityTypeInput) {
    try {
      const deviceOnboardingTenant = await this.getTenantModel<EntityType>(
        payload.accountId,
        EntityType.name,
        EntityTypeSchema
      );

      if (!deviceOnboardingTenant) {
        console.warn('Skipping create operation as tenantModel is null');
        return null; // or handle the case as needed
      }

      const existingRecord = await deviceOnboardingTenant.findOne({
        name: payload.name,
      });
      if (existingRecord) {
        throw new Error('Record Already Exists');
      }

      const record = await deviceOnboardingTenant.create({
        ...payload,
      });
      return record;
    } catch (error) {
      throw new Error(`Failed to create: ${error.message}`);
    }
  }

  async findAll(input: EntityTypeInput) {
    try {
      const deviceOnboardingTenant = await this.getTenantModel<EntityType>(
        input.accountId,
        EntityType.name,
        EntityTypeSchema
      );

      if (!deviceOnboardingTenant) {
        return { records: [], count: 0 };
      }

      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const records = await deviceOnboardingTenant
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      const count = await deviceOnboardingTenant.count().exec();
      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async searchLocations(input: SearchEntityInput) {
    try {
      const deviceOnboardingTenant = await this.getTenantModel<EntityType>(
        input.accountId,
        EntityType.name,
        EntityTypeSchema
      );

      if (!deviceOnboardingTenant) {
        return { records: [], count: 0 };
      }

      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const records = await deviceOnboardingTenant
        .find({
          $or: [{ type: { $regex: input.search, $options: 'i' } }],
        })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      const count = await deviceOnboardingTenant.countDocuments({
        $or: [{ type: { $regex: input.search, $options: 'i' } }],
      });
      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
