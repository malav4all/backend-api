import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { CreateGeoZoneInput, GeozoneInput } from './dto/create-geozone.input';
import { UpdateGeozoneInput } from './dto/update-geozone.input';
import axios from 'axios';
import { generateUniqueID } from '@imz/helper/generateotp';
import { Geozone, GeozoneSchema } from './enitity/geozone.entity';

@Injectable()
export class GeozoneService {
  constructor(
    @InjectConnection()
    private connection: Connection
  ) {}

  async sendOtp(mobileNumber: any, message: string) {
    try {
      const response = await axios.get(process.env.URL, {
        params: {
          method: 'SendMessage',
          v: '1.1',
          auth_scheme: process.env.AUTH_SCHEME,
          msg_type: process.env.MSG_TYPE,
          format: process.env.FORMAT,
          msg: `IMZ - ${message} is the One-Time Password (OTP) for login with IMZ`,
          send_to: Number(mobileNumber),
          userid: process.env.USERID,
          password: process.env.PASSWORD,
        },
        timeout: 120000,
      });

      return {
        success: response.status >= 400 ? 0 : 1,
        message:
          response.status >= 400
            ? 'Failed to send OTP'
            : 'OTP sent successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

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
    const tenantConnection = this.connection.useDb(
      `tenant_${tenantId.trim()}`,
      { useCache: true }
    );
    return tenantConnection.model(modelName, schema);
  }

  async create(payload: CreateGeoZoneInput) {
    try {
      const locationId = generateUniqueID('LN');
      const geoZoneModel = await this.getTenantModel<Geozone>(
        payload.accountId,
        Geozone.name,
        GeozoneSchema
      );

      if (!geoZoneModel) {
        console.warn('Skipping create operation as tenantModel is null');
        return null; // or handle the case as needed
      }

      const existingCircleName = await geoZoneModel.findOne({
        name: payload.name,
      });
      if (existingCircleName) {
        throw new Error('Record Already Exists');
      }

      const record = await geoZoneModel.create({
        ...payload,
        locationId,
      });
      return record;
    } catch (error) {
      throw new Error(`Failed to create geozone: ${error.message}`);
    }
  }

  async fetchGeozone(input: GeozoneInput) {
    try {
      const geoZoneModel = await this.getTenantModel<Geozone>(
        input.accountId,
        Geozone.name,
        GeozoneSchema
      );

      if (!geoZoneModel) {
        console.warn('Skipping fetch operation as tenantModel is null');
        return { records: [], count: 0 }; // return empty results or handle as needed
      }

      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const records = await geoZoneModel
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      const count = await geoZoneModel.count().exec();
      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(payload: UpdateGeozoneInput) {
    try {
      const geoZoneModel = await this.getTenantModel<Geozone>(
        payload.accountId,
        Geozone.name,
        GeozoneSchema
      );

      if (!geoZoneModel) {
        console.warn('Skipping update operation as tenantModel is null');
        return null; // or handle as needed
      }

      const updatePayload = {
        ...payload,
        updatedAt: new Date(),
      };
      const record = await geoZoneModel
        .findByIdAndUpdate(payload._id, updatePayload, {
          new: true,
        })
        .lean()
        .exec();
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
