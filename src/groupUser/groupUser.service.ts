import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Filter, TypeRelation } from '../common/object/filter';
import { Pagination } from '../common/object/pagination.object';
import { GroupUser } from './groupUser.entity';
import { GroupUserFilter } from './groupUser.filter';

@Injectable()
export class GroupUserService {
  constructor(
    @InjectRepository(GroupUser)
    private groupUserRepository: Repository<GroupUser>
  ) {}

  async findAll(pagination: Pagination, groupUserFilter: GroupUserFilter): Promise<[GroupUser[], number]> {
    const options: FindManyOptions = {
      skip: pagination.offset,
      take: pagination.limit
    };

    if (Object.keys(groupUserFilter).length > 0) {
      const groupFilterOption = {
        entityTypeFilter: [
          { typeRelation: TypeRelation.Eq, fields: ['group_id'] },
          { typeRelation: TypeRelation.Ilike, fields: ['title', 'description'] }
        ]
      };
      const filter: Filter<GroupUser> = new Filter<GroupUser>(groupUserFilter, groupFilterOption);
      options.where = filter.renderFilterOptionWhere();
    }

    return await this.groupUserRepository.findAndCount(options);
  }
}
