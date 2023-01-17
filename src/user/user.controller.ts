/* eslint-disable prettier/prettier */
import { Controller, Get, Query } from '@nestjs/common/decorators';
import { FindManyOptions } from 'typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {

  constructor(private readonly userService: UserService);

  @Get()
  async findAll(): Promise<[User[], number]> {
    const options: FindManyOptions = {};
    return await this.userService.findAll(options);
  }

  @Get('/:id')
  findOne(@Query('id')) {
    return this.userService.findAll(options);
  }
}
