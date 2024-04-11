import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Journey, JourneyDocument } from './entity/journey.entity';
import {
  CreateJourneyInput,
  JourneyInput,
  SearchJourneysInput,
} from './dto/create-journey.input';
import { UpdateJourneyInput } from './dto/update-journey.input';
import {
  AssertAssingmentModuleDocument,
  AssertAssingmentModuleEntity,
} from '@imz/assert-asingment/entities/assert-asingment.enitiy';

@Injectable()
export class JourneyService {
  constructor(
    @InjectModel(Journey.name)
    private JourneyModel: Model<JourneyDocument>,
    @InjectModel(AssertAssingmentModuleEntity.name)
    private AssertAssingmentModuleModule: Model<AssertAssingmentModuleDocument>
  ) {}

  async create(payload: CreateJourneyInput) {
    try {
      const existingRecord = await this.JourneyModel.findOne({
        journeyName: payload.journeyName,
      });
      if (existingRecord) {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }

      const record = await this.JourneyModel.create({
        ...payload,
      });
      return record;
    } catch (error) {
      throw new Error(`Failed to create : ${error.message}`);
    }
  }
  async findAll(input: JourneyInput) {
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;
      const records = await this.JourneyModel.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: 'journeyData' })
        .exec();
      const count = await this.JourneyModel.countDocuments().exec();
      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(payload: UpdateJourneyInput) {
    try {
      const updatePayload = {
        ...payload,
        updatedAt: new Date(),
      };
      const record = await this.JourneyModel.findByIdAndUpdate(
        payload._id,
        updatePayload,
        {
          new: true,
        }
      )
        .lean()
        .exec();
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async searchJourneys(input: SearchJourneysInput) {
    try {
      const page = Number(input.page) || 1;
      const limit = Number(input.limit) || 10;
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const record = await this.JourneyModel.find({
        $or: [
          { journeyName: { $regex: input.search, $options: 'i' } },
          { createdBy: { $regex: input.search, $options: 'i' } },
        ],
      })
        .skip(skip)
        .limit(limit)
        .populate({ path: 'journeyData' })
        .lean()
        .exec();
      const records = record.map((record) => ({
        ...record,
        journeyData: record.journeyData.filter(
          (journey) => journey.name != null
        ),
      }));

      const count = await this.JourneyModel.countDocuments({
        $or: [
          { journeyName: { $regex: input.search, $options: 'i' } },
          { createdBy: { $regex: input.search, $options: 'i' } },
        ],
      });
      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  public async getJourneyCount() {
    return await this.JourneyModel.countDocuments();
  }

  public async getOngoingJourneyCount() {
    const currentDate = new Date();
    return await this.JourneyModel.countDocuments({
      endDate: { $gte: currentDate },
    });
  }

  public async archiveJourney() {
    const currentDate = new Date();
    return await this.JourneyModel.find({
      endDate: { $lte: currentDate },
    });
  }

  public async upComingJourney() {
    const currentDate = new Date();
    return await this.JourneyModel.find({
      startDate: { $gte: currentDate },
    });
  }

  async findImeiWithJourneyDetails(page: number, limit: number) {
    try {
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const [result, count] = await Promise.all([
        this.AssertAssingmentModuleModule.aggregate([
          {
            $addFields: {
              convertedJourneyId: { $toObjectId: '$journey' },
            },
          },
          {
            $lookup: {
              from: 'journeys',
              localField: 'convertedJourneyId',
              foreignField: '_id',
              as: 'journeyDetails',
            },
          },
          {
            $unwind: '$journeyDetails',
          },
          {
            $lookup: {
              from: 'geozones',
              localField: 'journeyDetails.journeyData',
              foreignField: '_id',
              as: 'journeyDetails.journeyData',
            },
          },
          {
            $project: {
              imei: 1,
              journeyName: '$journeyDetails.journeyName',
              totalDuration: '$journeyDetails.totalDuration',
              totalDistance: '$journeyDetails.totalDistance',
              startDate: '$journeyDetails.startDate',
              endDate: '$journeyDetails.endDate',
              createdBy: '$journeyDetails.createdBy',
              journeyData: '$journeyDetails.journeyData',
              createdAt: '$journeyDetails.createdAt',
              updatedAt: '$journeyDetails.updatedAt',
            },
          },
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
        ]).exec(),
        this.AssertAssingmentModuleModule.aggregate([
          {
            $count: 'count',
          },
        ]).exec(),
      ]);

      return { result, count: count.length > 0 ? count[0].count : 0 };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
