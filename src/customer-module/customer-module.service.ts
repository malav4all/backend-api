/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CustomerModuleDocument,
  CustomerModule,
} from './enities/customer-module.enitiy';
import {
  CreateCustomerModuleInput,
  CustomerModuleExitsInput,
  CustomerModuleInput,
  SearchInput,
} from './dto/create-customer-module.input';
import { UpdateCustomerModuleInput } from './dto/update-customer-module.input';

@Injectable()
export class CustomerModuleService {
  constructor(
    @InjectModel(CustomerModule.name)
    private CustomerModuleModel: Model<CustomerModuleDocument>
  ) {}

  async count() {
    return await this.CustomerModuleModel.count().exec();
  }
  async findAll(input: CustomerModuleInput) {
    const page = Number(input.page);
    const limit = Number(input.limit);
    const skip = page === -1 ? 0 : (page - 1) * limit;
    const records = await this.CustomerModuleModel.find()
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    return records;
  }

  async create(payload: CreateCustomerModuleInput) {
    const record = await this.CustomerModuleModel.create(payload);
    return record;
  }
  async searchCustomerModule(input: SearchInput) {
    const page = Number(input.page);
    const limit = Number(input.limit);
    const skip = page === -1 ? 0 : (page - 1) * limit;
    const records = await this.CustomerModuleModel.find({
      $or: [
        { name: { $regex: input.search, $options: 'i' } },
        { code: { $regex: input.search, $options: 'i' } },
        { description: { $regex: input.search, $options: 'i' } },
      ],
    })
      .lean()
      .skip(skip)
      .limit(limit)
      .exec();

    const count = await this.CustomerModuleModel.countDocuments({
      $or: [
        { name: { $regex: input.search, $options: 'i' } },
        { code: { $regex: input.search, $options: 'i' } },
        { description: { $regex: input.search, $options: 'i' } },
      ],
    });

    return { records, count };
  }

  async update(payload: UpdateCustomerModuleInput) {
    const updatePayload = {
      ...payload,
      lastUpdated: new Date(),
    };
    const record = await this.CustomerModuleModel.findByIdAndUpdate(
      payload._id,
      updatePayload,
      {
        new: true,
      }
    ).exec();
    return record;
  }

  async checkExistsRecord(payload: CustomerModuleExitsInput) {
    const cleanedName = payload.name.trim();
    const cleanedCode = payload.code.trim();
    const record = await this.CustomerModuleModel.find({
      name: { $regex: new RegExp(cleanedName, 'i') },
      code: { $regex: new RegExp(cleanedCode, 'i') },
    })
      .lean()
      .exec();

    if (record.length === 0) {
      return undefined;
    }

    return record;
  }
}
