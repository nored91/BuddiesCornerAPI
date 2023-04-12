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
import { CreateUserDTO, UpdateUserDTO } from './user.dto';
import { User } from './user.entity';
import { UserFilter } from './user.filter';
import { UserService } from './user.service';
import { Group } from '../group/group.entity';

@Controller('user')
@ApiTags('User')
@UseFilters(ObjectNotFoundException)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiFilterQuery('filter', UserFilter)
  @ApiFilterQuery('page', Pagination)
  @ApiResponse({ status: 200, type: ObjectResponseRecord<User>, description: 'A list of user' })
  @Get()
  async findAll(@Query('page') pagination: Pagination, @Query('filter') userFilter: UserFilter): Promise<ObjectResponseRecord<User>> {
    return new ObjectResponseRecord<User>(await this.userService.findAll(pagination, userFilter));
  }

  @ApiResponse({ status: 200, type: User, description: 'Requested user' })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: 'No user found' })
  @ApiResponse({ status: 400, type: BadRequestException, description: 'Validation failed (uuid is expected)' })
  @Get('/:id')
  async findOne(@Param('id', ParseUUIDPipe) userId: string): Promise<User> {
    const user: User = await this.userService.findOne(userId);
    if (user === null) {
      throw new ObjectNotFoundException('User not found with id : ' + userId, 404);
    }
    return user;
  }

  @ApiResponse({ status: 201, type: ObjectResponseCreate<User>, description: 'The user has been created successfully' })
  @ApiResponse({ status: 400, type: BadRequestExceptionValidation, description: 'Bad Request - Validation failed' })
  @Post()
  async create(@Body() createUserDTO: CreateUserDTO): Promise<ObjectResponseCreate<User>> {
    return new ObjectResponseCreate<User>(await this.userService.create(createUserDTO), 'The user has been created successfully');
  }

  @ApiResponse({ status: 200, type: ObjectResponseUpdate, description: 'The user has been updated successfully' })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: 'No user found' })
  @ApiResponse({ status: 400, type: BadRequestException, description: 'Validation failed (uuid is expected)' })
  @Patch('/:id')
  async update(@Param('id', ParseUUIDPipe) userId: string, @Body() updateUserDTO: UpdateUserDTO): Promise<ObjectResponseUpdate> {
    updateUserDTO.user_id = userId;
    let user: User = await this.userService.findOne(userId);
    if (user === null) {
      throw new ObjectNotFoundException('User not found with id : ' + userId, 404);
    }
    user = await this.userService.patch(updateUserDTO);
    return new ObjectResponseUpdate(user.user_id, 'The user has been updated successfully');
  }

  @ApiResponse({ status: 200, type: ObjectResponseUpdate, description: 'The user has been deleted successfully' })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: 'No user found' })
  @ApiResponse({ status: 400, type: BadRequestException, description: 'Validation failed (uuid is expected)' })
  @Delete('/:id')
  async delete(@Param('id', ParseUUIDPipe) userId: string): Promise<ObjectResponseUpdate> {
    const user: User = await this.userService.findOne(userId);
    if (user === null) {
      throw new ObjectNotFoundException('User not found with id : ' + userId, 404);
    }
    await this.userService.delete({ user_id: userId });
    return new ObjectResponseUpdate(userId, 'The user has been deleted successfully');
  }
}
