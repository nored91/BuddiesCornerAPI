import { Body, Injectable, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findAll(): Promise<[User[], number]> {
    return this.userRepository.findAndCount();
  }

  findOne(id: string): Promise<User> {
    return this.userRepository.findOneBy({ user_id: id });
  }

  //create(UserDto: UserDto) { return null}
}
