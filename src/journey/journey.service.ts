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

@Injectable()
export class JourneyService {
  constructor(
    @InjectModel(Journey.name)
    private JourneyModel: Model<JourneyDocument>
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
      const page = Number(1);
      const limit = Number(10);
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
}
