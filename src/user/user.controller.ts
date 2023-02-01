/* eslint-disable prettier/prettier */
import { Delete, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { Body, Controller, Get, Post, Query, UseFilters } from '@nestjs/common/decorators';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ObjectResponseRecord } from 'src/common/response/objectResponseRecord';
<<<<<<< HEAD
import { BadRequestExceptionValidation } from '../common/exception/badRequestExceptionValidation';
import { ObjectNotFoundException } from '../common/exception/objectNotFoundException';
import { ApiFilterQuery } from '../common/object/api-filter-query';
import { Pagination } from '../common/object/pagination.object';
import { ObjectResponse } from '../common/response/objectResponse';
import { ObjectResponseCreate } from '../common/response/objectResponseCreate';
import { ObjectResponseUpdate } from '../common/response/objectResponseUpdate';
=======
import { BadRequestExceptionValidation } from 'src/common/exception/badRequestExceptionValidation';
import { ObjectNotFoundException } from 'src/common/exception/objectNotFoundException';
import { ApiFilterQuery } from 'src/common/object/api-filter-query';
import { Pagination } from 'src/common/object/pagination.object';
import { ObjectResponseCreate } from 'src/common/response/objectResponseCreate';
import { ObjectResponseRecord } from 'src/common/response/objectResponseRecord';
import { ObjectResponseUpdate } from 'src/common/response/objectResponseUpdate';
>>>>>>> e1b40820f6fd8f0393b1fc6b7abd1b0f3b06582a
import { CreateUserDTO, UpdateUserDTO } from './user.dto';
import { User } from './user.entity';
import { UserFilter } from './user.filter';
import { UserService } from './user.service'

@Controller('user')
@ApiTags('User')
@UseFilters(ObjectNotFoundException)
export class UserController {

  constructor(private readonly userService: UserService) { };

  @ApiFilterQuery('filter', UserFilter)
  @ApiFilterQuery('page', Pagination)
  @ApiResponse({ status: 200, type: ObjectResponseRecord<User>, description: "A list of user" })
  @Get()
  async findAll(@Query('page') pagination: Pagination, @Query('filter') userFilter: UserFilter): Promise<ObjectResponse<User>> {
    return new ObjectResponseRecord<User>(await this.userService.findAll(pagination, userFilter))
  }

  @ApiResponse({ status: 200, type: User, description: "Requested user" })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: "No user found" })
  @Get('/:id')
  async findOne(@Param('id', ParseUUIDPipe) userId: string) {
    const user: User = await this.userService.findOne(userId);
    if (user === null) {
      throw new ObjectNotFoundException('User not found with id : ' + userId, 404);
    }
    return user;
  }

  @ApiResponse({ status: 201, type: ObjectResponseCreate<User>, description: "The user has been created successfully" })
  @ApiResponse({ status: 400, type: BadRequestExceptionValidation, description: "Bad Request - Validation failed" })
  @Post()
  async create(@Body() createUserDTO: CreateUserDTO): Promise<ObjectResponseCreate<User>> {
    return new ObjectResponseCreate(await this.userService.create(createUserDTO), 'The user has been created successfully');
  }

  @ApiResponse({ status: 200, type: ObjectResponseUpdate, description: "The user has been updated successfully" })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: "No user found" })
  @Patch('/:id')
  async update(@Param('id', ParseUUIDPipe) userId: string, @Body() updateUserDTO: UpdateUserDTO) {
    updateUserDTO.user_id = userId;
    let user: User = await this.userService.findOne(userId);
    if (user === null) {
      throw new ObjectNotFoundException('User not found with id : ' + userId, 404);
    }
    user = await this.userService.patch(updateUserDTO);
    return new ObjectResponseUpdate(user.user_id, 'The user has been updated successfully')
  }


  @ApiResponse({ status: 200, type: ObjectResponseUpdate, description: "The user has been deleted successfully" })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: "No user found" })
  @Delete('/:id')
  async delete(@Param('id', ParseUUIDPipe) userId: string) {
    const user: User = await this.userService.findOne(userId);
    if (user === null) {
      throw new ObjectNotFoundException('User not found with id : ' + userId, 404);
    }
    await this.userService.delete({ user_id: userId });
    return new ObjectResponseUpdate(userId, 'The user has been deleted successfully');
  }
}

