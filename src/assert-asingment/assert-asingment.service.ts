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

      const aggregationPipeline: any[] = [
        {
          $addFields: {
            convertedJourneyId: {
              $cond: {
                if: { $ne: ['$journey', ''] }, // Check if journey is not empty
                then: { $toObjectId: '$journey' },
                else: null, // Set to null if journey is empty
              },
            },
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
          $unwind: {
            path: '$journeyDetails',
            preserveNullAndEmptyArrays: true,
          },
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
          $sort: {
            _id: -1,
          },
        },
      ];
      const countPipeline: any[] = [...aggregationPipeline];
      aggregationPipeline.push({ $skip: skip }, { $limit: limit });
      countPipeline.push({
        $count: 'total',
      });

      const [result, [totalCount]] = await Promise.all([
        this.AssertAssingmentModuleModule.aggregate(aggregationPipeline).exec(),
        this.AssertAssingmentModuleModule.aggregate(countPipeline).exec(),
      ]);

      return {
        result,
        count: totalCount ? totalCount.total : 0,
      };
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
      const pipeline = [
        {
          $addFields: {
            convertedJourneyId: {
              $cond: {
                if: { $ne: ['$journey', ''] },
                then: { $toObjectId: '$journey' },
                else: null,
              },
            },
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
          $unwind: {
            path: '$journeyDetails',
            preserveNullAndEmptyArrays: true,
          },
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
          $facet: {
            records: [
              { $skip: skip },
              { $limit: limit },
              {
                $project: {
                  imei: 1,
                  boxSet: 1,
                  labelName: 1,
                  createdBy: 1,
                  journey: '$journeyDetails',
                },
              },
            ],
            totalCount: [{ $count: 'total' }],
          },
        },
      ];
      const result = await this.AssertAssingmentModuleModule.aggregate(
        pipeline
      ).exec();
      const records = result[0].records;
      const count =
        result[0]?.totalCount?.length > 0 ? result[0]?.totalCount[0]?.total : 0;
      return { records, count };
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

  async findAllDevice() {
    try {
      const record = await this.AssertAssingmentModuleModule.find({});
      return record;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
