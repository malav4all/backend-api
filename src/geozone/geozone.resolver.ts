import { Args, Mutation, Resolver, Subscription } from '@nestjs/graphql';
import { GeozoneResponse } from './dto/response';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@imz/user/guard';
import { CreateGeoZoneInput, GeozoneInput } from './dto/create-geozone.input';
import { GeozoneService } from './geozone.service';
import { UpdateGeozoneInput } from './dto/update-geozone.input';
import { Coordinate } from '@imz/helper';

@Resolver(() => GeozoneResponse)
export class GeozoneResolver {
  constructor(private readonly geoZoneService: GeozoneService) {}

  @UseGuards(new AuthGuard())
  @Mutation(() => GeozoneResponse)
  async addGeozone(@Args('input') input: CreateGeoZoneInput) {
    try {
      const record = await this.geoZoneService.create(input);
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
  @Mutation(() => GeozoneResponse)
  async listGeozone(@Args('input') input: GeozoneInput) {
    try {
      const { count, records } = await this.geoZoneService.fetchGeozone(input);
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Geozone list available.',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => GeozoneResponse)
  async updateGeozone(@Args('input') input: UpdateGeozoneInput) {
    try {
      const record = await this.geoZoneService.update(input);
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

  @Subscription(() => Coordinate)
  coordinatesUpdated(@Args('topic') topic: string) {
    return this.geoZoneService.coordinatesUpdated(topic);
  }
}
