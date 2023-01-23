import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination } from 'src/common/object/pagination.object';
import { DeleteResult, FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { CreateUserDTO, UpdateUserDTO } from './user.dto';
import { User } from './user.entity';
import { UserFilter } from './user.filter';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async findAll(pagination: Pagination, userFilter: UserFilter): Promise<[User[], number]> {
    let options: FindManyOptions = {
      skip: pagination.offset,
      take: pagination.limit,
      where: userFilter.translateToFindOptionWhereList()
    };

    return await this.userRepository.findAndCount(options);
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
