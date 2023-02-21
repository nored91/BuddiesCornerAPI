/* eslint-disable prettier/prettier */
import { Controller, Get, Query, UseFilters } from '@nestjs/common/decorators';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ObjectNotFoundException } from '../common/exception/objectNotFoundException';
import { ApiFilterQuery } from '../common/object/api-filter-query';
import { Pagination } from '../common/object/pagination.object';
import { ObjectResponseRecord } from '../common/response/objectResponseRecord';
import { GroupUser } from './groupUser.entity';
import { GroupUserFilter } from './groupUser.filter';

import { GroupUserService } from './groupUser.service';

@Controller('group-user')
@ApiTags('group-user')
@UseFilters(ObjectNotFoundException)
export class GroupUserController {
  constructor(private readonly groupUserService: GroupUserService) {}

  @ApiFilterQuery('filter', GroupUserFilter)
  @ApiFilterQuery('page', Pagination)
  @ApiResponse({ status: 200, type: ObjectResponseRecord<GroupUser>, description: 'A list of user' })
  @Get()
  async findAll(@Query('page') pagination: Pagination, @Query('filter') groupUserFilter: GroupUserFilter): Promise<ObjectResponseRecord<GroupUser>> {
    return new ObjectResponseRecord<GroupUser>(await this.groupUserService.findAll(pagination, groupUserFilter));
  }
}
