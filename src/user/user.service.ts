import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination } from '../common/object/pagination.object';
import { DeleteResult, FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { CreateUserDTO, UpdateUserDTO } from './user.dto';
import { User } from './user.entity';
import { UserFilter } from './user.filter';
import { TypeRelation } from '../common/object/filter';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  // eslint-disable-next-line prettier/prettier
  async findAll(pagination: Pagination, userFilter: UserFilter): Promise<[User[], number]> {
    const userFilterOption = {
      entityTypeFilter: [
        { typeRelation: TypeRelation.Eq, fields: ['user_id', 'active'] },
        { typeRelation: TypeRelation.Ilike, fields: ['mail', 'firstname', 'lastname', 'pseudo'] }
      ]
    };

    const options: FindManyOptions = {
      skip: pagination.offset,
      take: pagination.limit,
      where: userFilter.renderFilterOptionWhere(userFilterOption)
    };
    return await this.userRepository.findAndCount(options);
  }

  async findOne(id: string): Promise<User> {
    return await this.userRepository.findOneBy({ user_id: id });
  }

  async create(createUserDTO: CreateUserDTO): Promise<User> {
    const user = await this.userRepository.save(createUserDTO);
    return await this.userRepository.findOneBy({ user_id: user.user_id });
  }

  async patch(updateUserDTO: UpdateUserDTO): Promise<User> {
    return await this.userRepository.save(updateUserDTO);
  }

  async delete(options: FindOptionsWhere<User>): Promise<DeleteResult> {
    return await this.userRepository.delete(options);
  }
}
