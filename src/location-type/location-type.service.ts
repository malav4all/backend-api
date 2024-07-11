import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import {
  LocationType,
  LocationTypeSchema,
} from './entity/location-type.entity';
import {
  CreateLocationTypeInput,
  LocationTypeInput,
  SearchLocationsInput,
} from './dto/create-location-type.input';
import { UpdateLocationTypeInput } from './dto/update-location-type.input';

@Injectable()
export class LocationTypeService {
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

  async create(payload: CreateLocationTypeInput) {
    try {
      const locationTypeModel = await this.getTenantModel<LocationType>(
        payload.accountId,
        LocationType.name,
        LocationTypeSchema
      );
      const existingRecord = await locationTypeModel.findOne({
        type: payload.type,
      });
      if (existingRecord) {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }

      const record = await locationTypeModel.create({ ...payload });
      return record;
    } catch (error) {
      throw new Error(`Failed to create: ${error.message}`);
    }
  }

  async findAll(input: LocationTypeInput) {
    try {
      const locationTypeModel = await this.getTenantModel<LocationType>(
        input.accountId,
        LocationType.name,
        LocationTypeSchema
      );
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;
      const records = await locationTypeModel
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      const count = await locationTypeModel.countDocuments().exec();
      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(payload: UpdateLocationTypeInput) {
    try {
      const locationTypeModel = await this.getTenantModel<LocationType>(
        payload.accountId,
        LocationType.name,
        LocationTypeSchema
      );
      const updatePayload = {
        ...payload,
        updatedAt: new Date(),
      };
      const record = await locationTypeModel
        .findByIdAndUpdate(payload._id, updatePayload, { new: true })
        .lean()
        .exec();
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async searchLocationTypes(input: SearchLocationsInput) {
    try {
      const locationTypeModel = await this.getTenantModel<LocationType>(
        input.accountId,
        LocationType.name,
        LocationTypeSchema
      );
      const page = Number(input.page) || 1;
      const limit = Number(input.limit) || 10;
      const skip = page === -1 ? 0 : (page - 1) * limit;
      const searchStr = input.search.trim();
      const searchNumber = parseFloat(searchStr);
      const isNumericSearch = !isNaN(searchNumber);

      let numericSearchConditions = [];
      if (isNumericSearch) {
        const decimalPlaces = searchStr.includes('.')
          ? searchStr.split('.')[1].length
          : 0;
        const precision = Math.pow(10, -decimalPlaces);
        const lowerBound = searchNumber;
        const upperBound = searchNumber + precision;

        numericSearchConditions = [
          { totalDistance: { $gte: lowerBound, $lt: upperBound } },
          { totalDuration: { $gte: lowerBound, $lt: upperBound } },
        ];
      }

      const searchConditions = [
        { type: { $regex: new RegExp(searchStr, 'i') } },
        { createdBy: { $regex: new RegExp(searchStr, 'i') } },
        ...numericSearchConditions,
      ];

      const records = await locationTypeModel
        .find({ $or: searchConditions })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      const count = await locationTypeModel.countDocuments({
        $or: searchConditions,
      });

      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
