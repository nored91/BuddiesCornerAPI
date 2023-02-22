/* eslint-disable prettier/prettier */
import { ParseUUIDPipe } from '@nestjs/common';
import { Controller, Get, Param, Query, UseFilters } from '@nestjs/common/decorators';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ObjectNotFoundException } from '../common/exception/objectNotFoundException';
import { ApiFilterQuery } from '../common/object/api-filter-query';
import { Pagination } from '../common/object/pagination.object';
import { ObjectResponseRecord } from '../common/response/objectResponseRecord';
import { GroupUser } from './groupUser.entity';
import { GroupUserFilter } from './groupUser.filter';
import { GroupUserService } from './groupUser.service';

@Controller('')
@ApiTags('group-user')
@UseFilters(ObjectNotFoundException)
export class GroupUserController {
  constructor(private readonly groupUserService: GroupUserService) {}

  @ApiFilterQuery('filter', GroupUserFilter)
  @ApiFilterQuery('page', Pagination)
  @ApiResponse({ status: 200, type: ObjectResponseRecord<GroupUser>, description: 'A list of user' })
  @Get('/group/:id/user')
  async findAllUser(@Param('id', ParseUUIDPipe) groupId: string) {
    return this.groupUserService.findAllUser(groupId);
  }

  @ApiFilterQuery('filter', GroupUserFilter)
  @ApiFilterQuery('page', Pagination)
  @ApiResponse({ status: 200, type: ObjectResponseRecord<GroupUser>, description: 'A list of group' })
  @Get('/user/:id/group')
  async findAllGroup(@Param('id', ParseUUIDPipe) userId: string) {
    return this.groupUserService.findAllGroup(userId);
  }
}
