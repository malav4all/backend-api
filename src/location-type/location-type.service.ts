import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  LocationTypeDocument,
  LocationType,
} from './entity/location-type.entity';
import { Model } from 'mongoose';
import {
  CreateLocationTypeInput,
  LocationTypeInput,
  SearchLocationsInput,
} from './dto/create-location-type.input';

@Injectable()
export class LocationTypeService {
  constructor(
    @InjectModel(LocationType.name)
    private LocationTypeModel: Model<LocationTypeDocument>
  ) {}

  async create(payload: CreateLocationTypeInput) {
    try {
      const existingRecord = await this.LocationTypeModel.findOne({
        type: payload.type,
      });
      if (existingRecord) {
        throw new Error('Record Already Exits');
      }

      const record = await this.LocationTypeModel.create({
        ...payload,
      });
      return record;
    } catch (error) {
      throw new Error(`Failed to create : ${error.message}`);
    }
  }
  async findAll(input: LocationTypeInput) {
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const records = await this.LocationTypeModel.find({})
        .skip(skip)
        .limit(limit)
        .exec();
      const count = await this.LocationTypeModel.count().exec();
      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async searchLocations(input: SearchLocationsInput) {
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const records = await this.LocationTypeModel.find({
        $or: [{ type: { $regex: input.search, $options: 'i' } }],
      })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      const count = await this.LocationTypeModel.countDocuments({
        $or: [{ type: { $regex: input.search, $options: 'i' } }],
      });
      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
