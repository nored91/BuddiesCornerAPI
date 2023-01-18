/* eslint-disable prettier/prettier */
import { Delete, Param, Patch } from '@nestjs/common';
import { Body, Controller, Get, Post } from '@nestjs/common/decorators';
import { FindManyOptions } from 'typeorm';
import { CreateUserDTO, UpdateUserDTO } from './user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {

  constructor(private readonly userService: UserService) { };

  @Get()
  async findAll(): Promise<[User[], number]> {
    const options: FindManyOptions = {};
    return await this.userService.findAll(options);
  }

  @Get('/:id')
  findOne(@Param('id') userId: string) {
    return this.userService.findOne(userId);
  }

  @Post()
  create(@Body() createUserDTO: CreateUserDTO) {
    return this.userService.create(createUserDTO);
  }

  @Patch('/:id')
  update(@Param('id') userId: string, @Body() updateUserDTO: UpdateUserDTO) {
    updateUserDTO.user_id = userId;
    return this.userService.patch(updateUserDTO);
  }

  @Delete('/:id')
  delete(@Param('id') userId: string) {
    return this.userService.delete({ user_id: userId });
  }
}
