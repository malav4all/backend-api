import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AssertAssingmentModuleInput,
  CheckAssertAssingmentModuleInput,
  CreateAssertAssingmentModuleInput,
  SearchAssertAssingmentModuleInput,
} from './dto/create-assert-asingment.input';
import { UpdateAssertAssingmentModuleInput } from './dto/update.assert-asingment';
import {
  AssertAssingmentModuleEntity,
  AssertAssingmentModuleDocument,
} from './entities/assert-asingment.enitiy';

@Injectable()
export class AssertAssingmentModuleService {
  constructor(
    @InjectModel(AssertAssingmentModuleEntity.name)
    private AssertAssingmentModuleModule: Model<AssertAssingmentModuleDocument>
  ) {}

  async count() {
    return await this.AssertAssingmentModuleModule.count().exec();
  }

  async findAll(input: AssertAssingmentModuleInput) {
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);

      const skip = page === -1 ? 0 : (page - 1) * limit;
      const [result, count] = await Promise.all([
        await this.AssertAssingmentModuleModule.aggregate([
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
              boxSet: 1,
              labelName: 1,
              createdBy: 1,
              journey: '$journeyDetails',
            },
          },
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
        ]).exec(),

        await this.AssertAssingmentModuleModule.aggregate([
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

  async create(payload: CreateAssertAssingmentModuleInput) {
    try {
      const record = await this.AssertAssingmentModuleModule.create(payload);
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(payload: UpdateAssertAssingmentModuleInput) {
    try {
      const updatePayload = {
        ...payload,
        lastUpdated: new Date(),
      };
      const record = await this.AssertAssingmentModuleModule.findByIdAndUpdate(
        payload._id,
        updatePayload,
        {
          new: true,
        }
      ).exec();
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async softDelete(payload: UpdateAssertAssingmentModuleInput) {
    try {
      const updatePayload = {
        ...payload,
        isDelete: true,
        lastUpdated: new Date(),
      };
      const record = await this.AssertAssingmentModuleModule.findByIdAndUpdate(
        payload._id,
        updatePayload,
        {
          new: true,
        }
      ).exec();
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async searchAssertAssingmentModel(input: SearchAssertAssingmentModuleInput) {
    try {
      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const [result, count] = await Promise.all([
        await this.AssertAssingmentModuleModule.aggregate([
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
            $match: {
              $or: [
                {
                  imei: isNaN(Number(input.search))
                    ? undefined
                    : Number(input.search),
                },
                { labelName: { $regex: input.search, $options: 'i' } },
                { boxSet: { $regex: input.search, $options: 'i' } },
                { createdBy: { $regex: input.search, $options: 'i' } },
                {
                  'journeyDetails.journeyName': {
                    $regex: input.search,
                    $options: 'i',
                  },
                },
              ],
            },
          },
          {
            $project: {
              imei: 1,
              boxSet: 1,
              labelName: 1,
              createdBy: 1,
              journey: '$journeyDetails',
            },
          },
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
        ]).exec(),

        await this.AssertAssingmentModuleModule.aggregate([
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

  async checkExistsRecord(payload: CheckAssertAssingmentModuleInput) {
    try {
      const record = await this.AssertAssingmentModuleModule.find({
        imei: {
          $in: [payload.imei],
        },
      })
        .lean()
        .exec();
      if (record.length === 0) {
        return undefined;
      }
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async bulkJourneyUpload(payload: CreateAssertAssingmentModuleInput[]) {
    try {
      const record = await this.AssertAssingmentModuleModule.insertMany(
        payload
      );
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
