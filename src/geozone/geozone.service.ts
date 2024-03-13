import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { GeozoneDocument, Geozone } from './enitity/geozone.entity';
import { Model } from 'mongoose';
import { CreateGeoZoneInput, GeozoneInput } from './dto/create-geozone.input';

@Injectable()
export class GeozoneService {
  constructor(
    @InjectModel(Geozone.name)
    private GeoZoneModel: Model<GeozoneDocument>
  ) {}

  async create(payload: CreateGeoZoneInput) {
    try {
      const existingCircleName = await this.GeoZoneModel.findOne({
        name: payload.name,
      });
      if (existingCircleName) {
        throw new Error('Record Already Exits');
      }

      const record = await this.GeoZoneModel.create({
        ...payload,
      });
      return record;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async fetchGeozone(input: GeozoneInput) {
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const records = await this.GeoZoneModel.find({})
        .skip(skip)
        .limit(limit)
        .exec();
      const count = await this.GeoZoneModel.count().exec();
      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
