import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import {
  InternalServerErrorException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@imz/user/guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import * as path from 'path';
import { IndustryCodeResponse, IndustryResponse } from './dto/response';
import {
  CreateIndustryInput,
  IndustryInput,
  SearchIndustryInput,
  checkExitIndustryInput,
  fetchIndustryNameCodeInput,
} from './dto/create-industry.input';
import { IndustryService } from './industry.service';
import { Any } from 'typeorm';

@Resolver(() => IndustryResponse)
export class IndustryResolver {
  constructor(private readonly industryService: IndustryService) {}

  @UseGuards(new AuthGuard())
  @Mutation(() => IndustryResponse)
  async createIndustry(@Args('input') input: CreateIndustryInput) {
    try {
      // if (input.file) {
      //   const { createReadStream, filename } = (await input.file) as any;
      //   const uploadDir = path.join(__dirname, '../../uploads/');

      //   if (!existsSync(uploadDir)) {
      //     mkdirSync(uploadDir);
      //   }
      //   const stream = createReadStream();
      //   const filePath = path.join(uploadDir, `${filename}`);

      //   await new Promise((resolve, reject) =>
      //     stream
      //       .pipe(createWriteStream(filePath))
      //       .on('finish', resolve)
      //       .on('error', reject)
      //   );
      const record = await this.industryService.create(input);
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
  @Mutation(() => IndustryResponse)
  async industryListAll(
    @Args('input') input: IndustryInput,
    @Context() context
  ) {
    try {
      const getLoggedIn = {
        accountId: context?.user?.accountId?.industryType,
        roleName: context.user.roleId.name,
      };
      const res = await this.industryService.findAll(input, getLoggedIn);
      const count = await this.industryService.count();
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Industry list available.',
        data: res,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => IndustryResponse)
  async searchIndustry(@Args('input') input: SearchIndustryInput) {
    try {
      const { records, count } = await this.industryService.searchIndustry(
        input
      );
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Search list available.',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Mutation(() => IndustryResponse)
  @UseGuards(new AuthGuard())
  async checkIndustryExistsRecord(
    @Args('input') input: checkExitIndustryInput
  ) {
    try {
      const record = await this.industryService.checkExistsRecord(input);
      return {
        success: record ? 1 : 0,
        message: record ? 'Record exists.' : 'Record not exists.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Mutation(() => IndustryCodeResponse)
  @UseGuards(new AuthGuard())
  async fetchIndustryName(@Args('input') input: fetchIndustryNameCodeInput) {
    try {
      const record = await this.industryService.getIndustryCodeRecord(input);
      return {
        success: record ? 1 : 0,
        message: record ? 'Record exists.' : 'Record not exists.',
        data: record,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
