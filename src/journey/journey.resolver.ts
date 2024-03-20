import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { JourneyResponseData } from './dto/response';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@imz/user/guard';
import { CreateJourneyInput, JourneyInput } from './dto/create-journey.input';
import { JourneyService } from './journey.service';

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
}
