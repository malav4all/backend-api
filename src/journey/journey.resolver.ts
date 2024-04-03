import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { JourneyResponseData } from './dto/response';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@imz/user/guard';
import {
  CreateJourneyInput,
  JourneyInput,
  SearchJourneysInput,
} from './dto/create-journey.input';
import { JourneyService } from './journey.service';
import { UpdateJourneyInput } from './dto/update-journey.input';

@Resolver(() => JourneyResponseData)
export class JourneyResolver {
  constructor(private readonly journeyService: JourneyService) {}

  @UseGuards(new AuthGuard())
  @Mutation(() => JourneyResponseData)
  async addJourney(@Args('input') input: CreateJourneyInput) {
    try {
      const record = await this.journeyService.create(input);
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
  @Mutation(() => JourneyResponseData)
  async fetchJourney(@Args('input') input: JourneyInput) {
    try {
      const { count, records } = await this.journeyService.findAll(input);
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
  @Mutation(() => JourneyResponseData)
  async updateJourney(@Args('input') input: UpdateJourneyInput) {
    try {
      const record = await this.journeyService.update(input);
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

  @Mutation(() => JourneyResponseData)
  async searchJourneys(@Args('input') input: SearchJourneysInput) {
    try {
      const { records, count } = await this.journeyService.searchJourneys(
        input
      );
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Journey list available.',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Mutation(() => JourneyResponseData)
  async findImei() {
    try {
      const result = await this.journeyService.findImeiWithJourneyDetails();
      return {
        success: result ? 1 : 0,
        message: 'Journey list available.',
        data: result,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
