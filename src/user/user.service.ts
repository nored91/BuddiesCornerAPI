import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination } from '../common/object/pagination.object';
import { DeleteResult, FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { CreateUserDTO, UpdateUserDTO } from './user.dto';
import { User } from './user.entity';
import { UserFilter } from './user.filter';
import { Filter, TypeRelation } from '../common/object/filter';
import { Group } from '../group/group.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async findAll(pagination: Pagination, userFilter: UserFilter): Promise<[User[], number]> {
    const options: FindManyOptions = {
      skip: pagination.offset,
      take: pagination.limit
    };

    if (Object.keys(userFilter).length > 0) {
      const userFilterOption = {
        entityTypeFilter: [
          { typeRelation: TypeRelation.Eq, fields: ['user_id', 'active'] },
          { typeRelation: TypeRelation.Ilike, fields: ['mail', 'firstname', 'lastname', 'pseudo'] }
        ]
      };
      const filter: Filter<User> = new Filter<User>(userFilter, userFilterOption);
      options.where = filter.renderFilterOptionWhere();
    }

    return await this.userRepository.findAndCount(options);
  }

  async findOne(userId: string): Promise<User> {
    return await this.userRepository.findOneBy({ user_id: userId });
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

  async findAllGroup(userId: string): Promise<Group[]> {
    return await this.userRepository
      .createQueryBuilder('user')
      .select(['group.group_id', 'group.title', 'group.description'])
      .leftJoin('user.groups', 'group')
      .where('user.user_id = :userId', { userId: userId })
      .getRawMany();
  }
}
