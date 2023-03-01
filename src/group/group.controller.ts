/* eslint-disable prettier/prettier */
import { BadRequestException, Delete, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { Body, Controller, Get, Post, Query, UseFilters } from '@nestjs/common/decorators';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ObjectResponseRecord } from '../common/response/objectResponseRecord';
import { BadRequestExceptionValidation } from '../common/exception/badRequestExceptionValidation';
import { ObjectNotFoundException } from '../common/exception/objectNotFoundException';
import { ApiFilterQuery } from '../common/object/api-filter-query';
import { Pagination } from '../common/object/pagination.object';
import { ObjectResponseCreate } from '../common/response/objectResponseCreate';
import { ObjectResponseUpdate } from '../common/response/objectResponseUpdate';
import { CreateGroupDTO, UpdateGroupDTO } from './group.dto';
import { Group } from './group.entity';
import { GroupFilter } from './group.filter';
import { GroupService } from './group.service';
import { User } from '../user/user.entity';

@Controller('group')
@ApiTags('Group')
@UseFilters(ObjectNotFoundException)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @ApiFilterQuery('filter', GroupFilter)
  @ApiFilterQuery('page', Pagination)
  @ApiResponse({ status: 200, type: ObjectResponseRecord<Group>, description: 'A list of group' })
  @Get()
  async findAll(@Query('page') pagination: Pagination, @Query('filter') groupFilter: GroupFilter): Promise<ObjectResponseRecord<Group>> {
    return new ObjectResponseRecord<Group>(await this.groupService.findAll(pagination, groupFilter));
  }

  @ApiResponse({ status: 200, type: Group, description: 'Requested group' })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: 'No group found' })
  @ApiResponse({ status: 400, type: BadRequestException, description: 'Validation failed (uuid is expected)' })
  @Get('/:id')
  async findOne(@Param('id', ParseUUIDPipe) groupId: string): Promise<Group> {
    const group: Group = await this.groupService.findOne(groupId);
    if (group === null) {
      throw new ObjectNotFoundException('Group not found with id : ' + groupId, 404);
    }
    return group;
  }

  @ApiResponse({ status: 201, type: ObjectResponseCreate<Group>, description: 'The group has been created successfully' })
  @ApiResponse({ status: 400, type: BadRequestExceptionValidation, description: 'Bad Request - Validation failed' })
  @Post()
  async create(@Body() createGroupDTO: CreateGroupDTO): Promise<ObjectResponseCreate<Group>> {
    return new ObjectResponseCreate<Group>(await this.groupService.create(createGroupDTO), 'The group has been created successfully');
  }

  @ApiResponse({ status: 200, type: ObjectResponseUpdate, description: 'The group has been updated successfully' })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: 'No group found' })
  @ApiResponse({ status: 400, type: BadRequestException, description: 'Validation failed (uuid is expected)' })
  @Patch('/:id')
  async update(@Param('id', ParseUUIDPipe) groupId: string, @Body() updateGroupDTO: UpdateGroupDTO): Promise<ObjectResponseUpdate> {
    updateGroupDTO.group_id = groupId;
    let group: Group = await this.groupService.findOne(groupId);
    if (group === null) {
      throw new ObjectNotFoundException('Group not found with id : ' + groupId, 404);
    }
    group = await this.groupService.patch(updateGroupDTO);
    return new ObjectResponseUpdate(group.group_id, 'The group has been updated successfully');
  }

  @ApiResponse({ status: 200, type: ObjectResponseUpdate, description: 'The group has been deleted successfully' })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: 'No group found' })
  @ApiResponse({ status: 400, type: BadRequestException, description: 'Validation failed (uuid is expected)' })
  @Delete('/:id')
  async delete(@Param('id', ParseUUIDPipe) groupId: string): Promise<ObjectResponseUpdate> {
    const group: Group = await this.groupService.findOne(groupId);
    if (group === null) {
      throw new ObjectNotFoundException('Group not found with id : ' + groupId, 404);
    }
    await this.groupService.delete({ group_id: groupId });
    return new ObjectResponseUpdate(groupId, 'The group has been deleted successfully');
  }
}
