import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@imz/user/guard';
import { FormBuilderResponse } from './dto/response';
import {
  CreateFormBuilderInput,
  FormBuildInput,
} from './dto/create-form-builder.input';
import { FormBuilderService } from './form-builder.service';
import { UpdateFormBuilderInput } from './dto/update-form-builder.input';

@Resolver(() => FormBuilderResponse)
export class FormBuilderResolver {
  constructor(private readonly formBuilderService: FormBuilderService) {}

  @UseGuards(new AuthGuard())
  @Mutation(() => FormBuilderResponse)
  async addFormBuilder(@Args('input') input: CreateFormBuilderInput) {
    try {
      const record = await this.formBuilderService.create(input);
      return {
        success: record ? 1 : 0,
        message: record
          ? 'Record created.'
          : 'Record not created. Please try again.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => FormBuilderResponse)
  async fetchFormBuilder(@Args('input') input: FormBuildInput) {
    try {
      const { count, records } = await this.formBuilderService.findAll(input);
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'list available.',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => FormBuilderResponse)
  async updateFormBuilder(@Args('input') input: UpdateFormBuilderInput) {
    try {
      const record = await this.formBuilderService.update(input);
      return {
        success: record ? 1 : 0,
        message: record
          ? 'Records update successfully.'
          : 'Technical issue please try again.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
