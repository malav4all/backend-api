import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  CreateFormBuilderInput,
  FormBuildInput,
} from './dto/create-form-builder.input';
import { FormBuilder, FormBuilderSchema } from './entity/form-builder.entity';
import { UpdateFormBuilderInput } from './dto/update-form-builder.input';

export class FormBuilderService {
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

  async create(payload: CreateFormBuilderInput) {
    try {
      const formBuilderModel = await this.getTenantModel<FormBuilder>(
        payload.accountId,
        FormBuilder.name,
        FormBuilderSchema
      );
      const existingRecord = await formBuilderModel.findOne({
        formId: payload.formId,
      });
      if (existingRecord) {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }
      const record = await formBuilderModel.create({ ...payload });
      return record;
    } catch (error) {
      throw new Error(`Failed to create:${error.message}`);
    }
  }

  async findAll(input: FormBuildInput) {
    try {
      const formBuilderModel = await this.getTenantModel<FormBuilder>(
        input.accountId,
        FormBuilder.name,
        FormBuilderSchema
      );

      const page = Number(input.page);
      const limit = Number(input.limit);
      const skip = page === -1 ? 0 : (page - 1) * limit;

      const records = await formBuilderModel
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      const count = await formBuilderModel.count().exec();
      return { records, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(payload: UpdateFormBuilderInput) {
    try {
      const formBuilderModel = await this.getTenantModel<FormBuilder>(
        payload.accountId,
        FormBuilder.name,
        FormBuilderSchema
      );
      const updatePayload = {
        ...payload,
        updatedAt: new Date(),
      };
      const record = await formBuilderModel
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
