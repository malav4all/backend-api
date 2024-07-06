import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Journey, JourneySchema } from './entity/journey.entity';
import {
  CreateJourneyInput,
  JourneyInput,
  SearchJourneysInput,
} from './dto/create-journey.input';
import { UpdateJourneyInput } from './dto/update-journey.input';

@Injectable()
export class JourneyService {
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

  async create(payload: CreateJourneyInput) {
    try {
      const journeyModel = await this.getTenantModel<Journey>(
        payload.accountId,
        Journey.name,
        JourneySchema
      );
      const existingRecord = await journeyModel.findOne({
        journeyName: payload.journeyName,
      });
      if (existingRecord) {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }

      const record = await journeyModel.create({
        ...payload,
      });
      return record;
    } catch (error) {
      throw new Error(`Failed to create : ${error.message}`);
    }
  }
  async findAll(input: JourneyInput) {
    try {
      const journeyModel = await this.getTenantModel<Journey>(
        input.accountId,
        Journey.name,
        JourneySchema
      );
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;
      const records = await journeyModel
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: 'journeyData' })
        .exec();
      const count = await journeyModel.countDocuments().exec();
      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(payload: UpdateJourneyInput) {
    try {
      const journeyModel = await this.getTenantModel<Journey>(
        payload.accountId,
        Journey.name,
        JourneySchema
      );
      const updatePayload = {
        ...payload,
        updatedAt: new Date(),
      };
      const record = await journeyModel
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

  async searchJourneys(input: SearchJourneysInput) {
    try {
      const journeyModel = await this.getTenantModel<Journey>(
        input.accountId,
        Journey.name,
        JourneySchema
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
        { journeyName: { $regex: new RegExp(searchStr, 'i') } },
        { createdBy: { $regex: new RegExp(searchStr, 'i') } },
        ...numericSearchConditions,
      ];

      const records = await journeyModel
        .find({ $or: searchConditions })
        .skip(skip)
        .limit(limit)
        .populate({ path: 'journeyData' })
        .lean()
        .exec();

      const formattedRecords = records.map((record) => ({
        ...record,
        journeyData: record.journeyData.filter(
          (journey) => journey.name != null
        ),
      }));

      const count = await journeyModel.countDocuments({
        $or: searchConditions,
      });

      return { records: formattedRecords, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // public async getJourneyCount() {
  //   return await this.JourneyModel.countDocuments();
  // }

  // public async getOngoingJourneyCount() {
  //   const currentDate = new Date();
  //   return await this.JourneyModel.countDocuments({
  //     endDate: { $gte: currentDate },
  //   });
  // }

  // public async archiveJourney() {
  //   const currentDate = new Date();
  //   return await this.JourneyModel.find({
  //     endDate: { $lte: currentDate },
  //   });
  // }

  // public async upComingJourney() {
  //   const currentDate = new Date();
  //   return await this.JourneyModel.find({
  //     startDate: { $gte: currentDate },
  //   });
  // }

  // async findImeiWithJourneyDetails(page: number, limit: number) {
  //   try {
  //     const skip = page === -1 ? 0 : (page - 1) * limit;

  //     const [result, count] = await Promise.all([
  //       this.AssertAssingmentModuleModule.aggregate([
  //         {
  //           $addFields: {
  //             convertedJourneyId: { $toObjectId: '$journey' },
  //           },
  //         },
  //         {
  //           $lookup: {
  //             from: 'journeys',
  //             localField: 'convertedJourneyId',
  //             foreignField: '_id',
  //             as: 'journeyDetails',
  //           },
  //         },
  //         {
  //           $unwind: '$journeyDetails',
  //         },
  //         {
  //           $lookup: {
  //             from: 'geozones',
  //             localField: 'journeyDetails.journeyData',
  //             foreignField: '_id',
  //             as: 'journeyDetails.journeyData',
  //           },
  //         },
  //         {
  //           $project: {
  //             imei: 1,
  //             journeyName: '$journeyDetails.journeyName',
  //             totalDuration: '$journeyDetails.totalDuration',
  //             totalDistance: '$journeyDetails.totalDistance',
  //             startDate: '$journeyDetails.startDate',
  //             endDate: '$journeyDetails.endDate',
  //             createdBy: '$journeyDetails.createdBy',
  //             journeyData: '$journeyDetails.journeyData',
  //             createdAt: '$journeyDetails.createdAt',
  //             updatedAt: '$journeyDetails.updatedAt',
  //           },
  //         },
  //         {
  //           $skip: skip,
  //         },
  //         {
  //           $limit: limit,
  //         },
  //       ]).exec(),
  //       this.AssertAssingmentModuleModule.aggregate([
  //         {
  //           $count: 'count',
  //         },
  //       ]).exec(),
  //     ]);

  //     return { result, count: count.length > 0 ? count[0].count : 0 };
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }
}
