import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@imz/user/guard';
import { RouteService } from './route.service';
import { UpdateRouteInput } from './dto/update-route.input';
import { RouteResponseData } from './dto/response';
import {
  CreateRouteInput,
  RouteInput,
  SearchRouteInput,
} from './dto/create-route.input';

@Resolver(() => RouteResponseData)
export class RouteResolver {
  constructor(private readonly routeService: RouteService) {}

  @UseGuards(new AuthGuard())
  @Mutation(() => RouteResponseData)
  async addRoute(@Args('input') input: CreateRouteInput) {
    try {
      const record = await this.routeService.create(input);
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
  @Mutation(() => RouteResponseData)
  async fetchRoute(@Args('input') input: RouteInput) {
    try {
      const { count, records } = await this.routeService.findAll(input);
      const success = records.length > 0 ? 1 : 0;
      return {
        paginatorInfo: {
          count,
        },
        success: success,
        message: success ? 'list available.' : 'No data found.',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => RouteResponseData)
  async updateRoute(@Args('input') input: UpdateRouteInput) {
    try {
      const record = await this.routeService.update(input);
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

  @UseGuards(new AuthGuard())
  @Mutation(() => RouteResponseData)
  async searchRoute(@Args('input') input: SearchRouteInput) {
    try {
      const { records, count } = await this.routeService.searchRoute(input);
      const success = records.length > 0 ? 1 : 0;
      return {
        paginatorInfo: {
          count,
        },
        success: success,
        message: success ? 'Journey list available.' : 'No journey found.',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
