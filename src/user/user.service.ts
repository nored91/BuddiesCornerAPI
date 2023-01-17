import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeleteResult,
  FindManyOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { CreateUserDTO, UpdateUserDTO } from './user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(options: FindManyOptions): Promise<[User[], number]> {
    return await this.userRepository.findAndCount();
  }

  async findOne(id: string): Promise<User> {
    return await this.userRepository.findOneBy({ user_id: id });
  }

  async create(createUserDTO: CreateUserDTO): Promise<User> {
    return await this.userRepository.save(createUserDTO);
  }

  async patch(updateUserDTO: UpdateUserDTO): Promise<User> {
    return await this.userRepository.save(updateUserDTO);
  }

  async delete(options: FindOptionsWhere<User>): Promise<DeleteResult> {
    return await this.userRepository.delete(options);
  }
}
