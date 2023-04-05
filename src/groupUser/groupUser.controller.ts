/* eslint-disable prettier/prettier */
import { BadRequestException, ParseUUIDPipe } from '@nestjs/common';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseFilters } from '@nestjs/common/decorators';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ObjectNotFoundException } from '../common/exception/objectNotFoundException';
import { ApiFilterQuery } from '../common/object/api-filter-query';
import { Pagination } from '../common/object/pagination.object';
import { ObjectResponseCreate } from '../common/response/objectResponseCreate';
import { ObjectResponseRecord } from '../common/response/objectResponseRecord';
import { ObjectResponseUpdate } from '../common/response/objectResponseUpdate';
import { Group } from '../group/group.entity';
import { GroupService } from '../group/group.service';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { CreateGroupUserDTO, UpdateGroupUserDTO } from './groupUser.dto';
import { GroupUser } from './groupUser.entity';
import { GroupUserFilter } from './groupUser.filter';
import { GroupUserService } from './groupUser.service';

@Controller('')
@ApiTags('group-user')
@UseFilters(ObjectNotFoundException)
export class GroupUserController {
  constructor(
    private readonly groupUserService: GroupUserService,
    private readonly userService: UserService,
    private readonly groupService: GroupService
  ) {}

  @ApiFilterQuery('filter', GroupUserFilter)
  @ApiFilterQuery('page', Pagination)
  @ApiResponse({ status: 200, type: Array<GroupUser>, description: 'A list of user' })
  @ApiResponse({ status: 400, type: BadRequestException, description: 'Validation failed (uuid is expected)' })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: 'No group found' })
  @Get('/group/:id/user')
  async findAllUser(@Param('id', ParseUUIDPipe) groupId: string): Promise<GroupUser[]> {
    const group: Group = await this.groupService.findOne(groupId);
    if (group === null) {
      throw new ObjectNotFoundException('Group not found with id : ' + groupId, 404);
    }
    return await this.groupUserService.findAllUser(groupId);
  }

  @ApiFilterQuery('filter', GroupUserFilter)
  @ApiFilterQuery('page', Pagination)
  @ApiResponse({ status: 200, type: Array<GroupUser>, description: 'A list of group' })
  @ApiResponse({ status: 400, type: BadRequestException, description: 'Validation failed (uuid is expected)' })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: 'No user found' })
  @Get('/user/:id/group')
  async findAllGroup(@Param('id', ParseUUIDPipe) userId: string): Promise<GroupUser[]> {
    const user: User = await this.userService.findOne(userId);
    if (user === null) {
      throw new ObjectNotFoundException('User not found with id : ' + userId, 404);
    }
    return await this.groupUserService.findAllGroup(userId);
  }

  @ApiFilterQuery('filter', GroupUserFilter)
  @ApiFilterQuery('page', Pagination)
  @ApiResponse({ status: 200, type: ObjectResponseRecord<GroupUser>, description: 'The user has been added successfully to the group' })
  @ApiResponse({ status: 400, type: BadRequestException, description: 'Validation failed (uuid is expected)' })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: 'No user/group found' })
  @Post('/group/:group_id/user/:user_id')
  async createGroupUser(
    @Param('group_id', ParseUUIDPipe) groupId: string,
    @Param('user_id', ParseUUIDPipe) userId: string,
    @Body() createGroupUserDTO: CreateGroupUserDTO
  ): Promise<ObjectResponseCreate<GroupUser>> {
    const group: Group = await this.groupService.findOne(groupId);
    if (group === null) {
      throw new ObjectNotFoundException('Group not found with id : ' + groupId, 404);
    }
    createGroupUserDTO.group_id = group.group_id;
    const user: User = await this.userService.findOne(userId);
    if (user === null) {
      throw new ObjectNotFoundException('User not found with id : ' + userId, 404);
    }
    createGroupUserDTO.user_id = user.user_id;
    return new ObjectResponseCreate<GroupUser>(
      await this.groupUserService.createGroupUser(createGroupUserDTO),
      'The user has been added successfully to the group'
    );
  }

  @ApiFilterQuery('filter', GroupUserFilter)
  @ApiFilterQuery('page', Pagination)
  @ApiResponse({ status: 200, type: ObjectResponseRecord<GroupUser>, description: 'The user group has been updated successfully' })
  @ApiResponse({ status: 400, type: BadRequestException, description: 'Validation failed (uuid is expected)' })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: 'No user/group found' })
  @Patch('/group/:group_id/user/:user_id')
  async UpdateGroupUser(
    @Param('group_id', ParseUUIDPipe) groupId: string,
    @Param('user_id', ParseUUIDPipe) userId: string,
    @Body() updateGroupUserDTO: UpdateGroupUserDTO
  ): Promise<ObjectResponseUpdate> {
    const group: Group = await this.groupService.findOne(groupId);
    if (group === null) {
      throw new ObjectNotFoundException('Group not found with id : ' + groupId, 404);
    }
    updateGroupUserDTO.group_id = group.group_id;
    const user: User = await this.userService.findOne(userId);
    if (user === null) {
      throw new ObjectNotFoundException('User not found with id : ' + userId, 404);
    }
    updateGroupUserDTO.user_id = user.user_id;
    let userGroup: GroupUser = await this.groupUserService.findOneGroupUser(groupId, userId);
    if (userGroup === null) {
      throw new ObjectNotFoundException('GroupUser not found with user id : ' + userId + ' and group id : ' + groupId, 404);
    }
    userGroup = await this.groupUserService.patchGroupUser(updateGroupUserDTO);
    let userGroupId: string = '{ group_id : ' + userGroup.group_id + ', user_id : ' + userGroup.user_id + ' }';
    return new ObjectResponseUpdate(userGroupId, 'The user group has been updated successfully');
  }

  @ApiFilterQuery('filter', GroupUserFilter)
  @ApiFilterQuery('page', Pagination)
  @ApiResponse({ status: 200, type: ObjectResponseRecord<GroupUser>, description: 'The user group has been deleted successfully' })
  @ApiResponse({ status: 400, type: BadRequestException, description: 'Validation failed (uuid is expected)' })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: 'No user/group found' })
  @Delete('/group/:group_id/user/:user_id')
  async deleteGroupUser(
    @Param('group_id', ParseUUIDPipe) groupId: string,
    @Param('user_id', ParseUUIDPipe) userId: string
  ): Promise<ObjectResponseUpdate> {
    const group: Group = await this.groupService.findOne(groupId);
    if (group === null) {
      throw new ObjectNotFoundException('Group not found with id : ' + groupId, 404);
    }
    const user: User = await this.userService.findOne(userId);
    if (user === null) {
      throw new ObjectNotFoundException('User not found with id : ' + userId, 404);
    }
    let userGroup: GroupUser = await this.groupUserService.findOneGroupUser(groupId, userId);
    if (userGroup === null) {
      throw new ObjectNotFoundException('GroupUser not found with user id : ' + userId + ' and group id : ' + groupId, 404);
    }
    await this.groupUserService.deleteGroupUser({ group_id: groupId, user_id: userId });
    let userGroupId: string = '{ group_id : ' + userGroup.group_id + ', user_id : ' + userGroup.user_id + ' }';
    return new ObjectResponseUpdate(userGroupId, 'The user group has been deleted successfully');
  }
}
