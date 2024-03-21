import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Journey, JourneyDocument } from './entity/journey.entity';
import { CreateJourneyInput, JourneyInput } from './dto/create-journey.input';
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
        throw new Error('Record Already Exits');
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
}
