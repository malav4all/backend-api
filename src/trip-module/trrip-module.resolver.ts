import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@imz/user/guard';
import {
  BatteryResponse,
  FileUploadResponse,
  TripMetricsResponseWrapper,
  TripResponse,
} from './dto/response';
import { TripService } from './trip-module.service';
import {
  BatteryCheckInput,
  CreateTripInput,
  FileUploadInput,
  SearchTripInput,
  TripIDInput,
  TripInput,
  TripStatusInput,
} from './dto/create-trip-module.input';
import { UpdateTripInput } from './dto/update-trip-module.update';
import * as path from 'path';
import { createWriteStream, existsSync, mkdirSync } from 'fs';

@Resolver(() => TripResponse)
export class TripResolver {
  constructor(private readonly tripService: TripService) {}

  @UseGuards(new AuthGuard())
  @Mutation(() => TripResponse)
  async createTrip(@Args('input') input: CreateTripInput) {
    try {
      const { tripId, record } = await this.tripService.create(input);
      return {
        success: record ? 1 : 0,
        message: record
          ? `Trip created Successful - ${tripId}`
          : 'Record not created. Please try again.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => FileUploadResponse)
  async fileUpload(
    @Args('input') input: FileUploadInput
  ): Promise<FileUploadResponse> {
    try {
      if (input.file) {
        const { createReadStream, filename } = (await input.file) as any;
        const uploadDir = path?.join(__dirname, '../../uploads/');

        if (!existsSync(uploadDir)) {
          mkdirSync(uploadDir);
        }
        const stream = createReadStream();
        const filePath = path?.join(uploadDir, `${filename}`);

        await new Promise((resolve, reject) =>
          stream
            .pipe(createWriteStream(filePath))
            .on('finish', resolve)
            .on('error', reject)
        );
        // Return success response
        return {
          fileName: filename,
          message: 'File uploaded successfully',
        };
      } else {
        throw new Error('No file provided');
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => TripResponse)
  async tripList(@Args('input') input: TripInput, @Context() context) {
    try {
      const loggedInUser = {
        userId: context?.user?._id,
      };
      const { count, records } = await this.tripService.findAll(
        input,
        loggedInUser
      );
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Trip list available.',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => TripResponse)
  async searchTrip(@Args('input') input: SearchTripInput) {
    try {
      const { records, count } = await this.tripService.searchTrip(input);
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

  @UseGuards(new AuthGuard())
  @Mutation(() => TripResponse)
  async fetchTripById(@Args('input') input: TripIDInput) {
    try {
      const record = await this.tripService.getTripDetailById(input);
      return {
        success: 1,
        message: 'Search list available.',
        data: [record],
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => TripResponse)
  async updateTrip(@Args('input') input: UpdateTripInput) {
    try {
      const record = await this.tripService.update(input);
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

  @Mutation(() => BatteryResponse)
  async checkBattery(
    @Args('input') input: BatteryCheckInput
  ): Promise<{ success: boolean; message: string }> {
    return this.tripService.checkBatteryPercentage(input);
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => TripMetricsResponseWrapper)
  async getTripStatusMetrics(@Args('input') input: TripInput) {
    try {
      const metrics = await this.tripService.getTripStatusMetrics(
        input.accountId
      );
      return {
        success: 1,
        message: 'Trip status metrics retrieved successfully.',
        data: metrics,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // @UseGuards(new AuthGuard())
  @Mutation(() => TripResponse)
  async updateTripStatus(@Args('input') input: TripStatusInput) {
    try {
      const updatedTrip = await this.tripService.updateTripStatus(
        input.accountId,
        input.tripId,
        input.status
      );
      return {
        success: 1,
        message: `Trip with ID ${updatedTrip.tripId} successfully updated to status ${updatedTrip.status}`,
        data: [updatedTrip],
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
