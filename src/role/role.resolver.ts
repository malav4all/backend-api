import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { RoleService } from './role.service';
import {
  CreateRoleInput,
  RoleInput,
  SearchRolesInput,
  checkRoleInput,
} from './dto/create-role.input';
import { RoleResponse } from './dto/response';
import { UpdateRoleInput } from './dto/update-role.input';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@imz/user/guard';

@Resolver(() => RoleResponse)
export class RoleResolver {
  constructor(private readonly roleService: RoleService) {}

  @UseGuards(new AuthGuard())
  @Mutation(() => RoleResponse)
  async createRole(@Args('input') input: CreateRoleInput) {
    try {
      const record = await this.roleService.create(input);
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
  @Mutation(() => RoleResponse)
  async roleListAll(@Args('input') input: RoleInput, @Context() context) {
    try {
      const loggedInUser = {
        userId: context?.user?._id,
      };
      const roles = await this.roleService.findAll(input, loggedInUser);
      const count = await this.roleService.count();
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Role list available.',
        data: roles,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => RoleResponse)
  async delete(@Args('input') input: UpdateRoleInput) {
    try {
      const record = await this.roleService.softDelete(input);
      return {
        success: record ? 1 : 0,
        message: record
          ? 'Records Delete successfully.'
          : 'Technical issue please try again.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => RoleResponse)
  async searchRoles(@Args('input') input: SearchRolesInput) {
    try {
      const { records, count } = await this.roleService.searchRoles(input);
      return {
        paginatorInfo: {
          count,
        },
        success: 1,
        message: 'Role list available.',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Mutation(() => RoleResponse)
  @UseGuards(new AuthGuard())
  async checkExistsRole(@Args('input') input: checkRoleInput) {
    try {
      const record = await this.roleService.checkExistsRecord(input);
      return {
        success: record ? 1 : 0,
        message: record ? `${input.name} Already Exits` : 'Record not exists.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(new AuthGuard())
  @Mutation(() => RoleResponse)
  async updateRoleData(@Args('input') input: UpdateRoleInput) {
    try {
      const record = await this.roleService.update(input);
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
