import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import {
  CreateRouteInput,
  RouteInput,
  SearchRouteInput,
} from './dto/create-route.input';
import { UpdateRouteInput } from './dto/update-route.input';
import { Route, RouteSchema } from './entity/route.entity';
import { generateUniqueID } from '@imz/helper/generateotp';

@Injectable()
export class RouteService {
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
    const tenantConnection = this.connection.useDb(
      `tenant_${tenantId.trim()}`,
      { useCache: true }
    );
    return tenantConnection.model(modelName, schema);
  }

  async create(payload: CreateRouteInput) {
    try {
      const routeId = generateUniqueID('RT');
      const routeModel = await this.getTenantModel<Route>(
        payload.accountId,
        Route.name,
        RouteSchema
      );

      if (!routeModel) {
        console.warn('Skipping create operation as tenantModel is null');
        return null; // or handle the case as needed
      }

      const existingRecord = await routeModel.findOne({
        routeName: payload.routeName,
      });
      if (existingRecord) {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }

      const record = await routeModel.create({
        ...payload,
        routeId,
      });
      return record;
    } catch (error) {
      throw new Error(`Failed to create : ${error.message}`);
    }
  }

  async findAll(input: RouteInput) {
    try {
      const routeModel = await this.getTenantModel<Route>(
        input.accountId,
        Route.name,
        RouteSchema
      );

      if (!routeModel) {
        return { records: [], count: 0 };
      }

      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const aggregationPipeline: any = [
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
        {
          $addFields: {
            routesData: {
              $map: {
                input: '$routesData',
                as: 'routeId',
                in: { $toObjectId: '$$routeId' },
              },
            },
          },
        },
        {
          $lookup: {
            from: 'geozones',
            localField: 'routesData',
            foreignField: '_id',
            as: 'routeDetails',
          },
        },
      ];

      const records = await routeModel.aggregate(aggregationPipeline).exec();

      const count = await routeModel.countDocuments().exec();

      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(payload: UpdateRouteInput) {
    try {
      const routeModel = await this.getTenantModel<Route>(
        payload.accountId,
        Route.name,
        RouteSchema
      );

      if (!routeModel) {
        return null; // or handle as needed
      }

      const updatePayload = {
        ...payload,
        updatedAt: new Date(),
      };
      const record = await routeModel
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

  async searchRoute(input: SearchRouteInput) {
    try {
      const routeModel = await this.getTenantModel<Route>(
        input.accountId,
        Route.name,
        RouteSchema
      );

      if (!routeModel) {
        console.warn('Skipping searchRoute operation as tenantModel is null');
        return { records: [], count: 0 };
      }

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
        { routeName: { $regex: new RegExp(searchStr, 'i') } },
        { routeId: { $regex: new RegExp(searchStr, 'i') } },
        { createdBy: { $regex: new RegExp(searchStr, 'i') } },
        ...numericSearchConditions,
      ];

      const aggregationPipeline: any = [
        {
          $match: {
            $or: searchConditions,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
        {
          $addFields: {
            routesData: {
              $map: {
                input: '$routesData',
                as: 'routeId',
                in: { $toObjectId: '$$routeId' },
              },
            },
          },
        },
        {
          $lookup: {
            from: 'geozones',
            localField: 'routesData',
            foreignField: '_id',
            as: 'routeDetails',
          },
        },
      ];

      const records = await routeModel.aggregate(aggregationPipeline).exec();

      const count = await routeModel.countDocuments({
        $or: searchConditions,
      });

      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
