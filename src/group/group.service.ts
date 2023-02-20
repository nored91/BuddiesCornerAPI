import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination } from '../common/object/pagination.object';
import { DeleteResult, FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { CreateGroupDTO, UpdateGroupDTO } from './group.dto';
import { Group } from './group.entity';
import { GroupFilter } from './group.filter';
import { Filter, TypeRelation } from '../common/object/filter';
import { User } from '../user/user.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>
  ) {}

  async findAll(pagination: Pagination, groupFilter: GroupFilter): Promise<[Group[], number]> {
    const options: FindManyOptions = {
      skip: pagination.offset,
      take: pagination.limit
    };

    if (Object.keys(groupFilter).length > 0) {
      const groupFilterOption = {
        entityTypeFilter: [
          { typeRelation: TypeRelation.Eq, fields: ['group_id'] },
          { typeRelation: TypeRelation.Ilike, fields: ['title', 'description'] }
        ]
      };
      const filter: Filter<Group> = new Filter<Group>(groupFilter, groupFilterOption);
      options.where = filter.renderFilterOptionWhere();
    }

    return await this.groupRepository.findAndCount(options);
  }

  async findOne(groupId: string): Promise<Group> {
    return await this.groupRepository.findOneBy({ group_id: groupId });
  }

  async create(createGroupDTO: CreateGroupDTO): Promise<Group> {
    const group = await this.groupRepository.save(createGroupDTO);
    return await this.groupRepository.findOneBy({ group_id: group.group_id });
  }

  async patch(updateGroupDTO: UpdateGroupDTO): Promise<Group> {
    return await this.groupRepository.save(updateGroupDTO);
  }

  async delete(options: FindOptionsWhere<Group>): Promise<DeleteResult> {
    return await this.groupRepository.delete(options);
  }

  async findAllUser(groupId: string): Promise<User[]> {
    return this.groupRepository
      .createQueryBuilder('group')
      .select(['user.user_id', 'user.firstname', 'user.lastname', 'user.mail', 'user.pseudo'])
      .leftJoin('group.users', 'user')
      .where('group.group_id = :groupId', { groupId: groupId })
      .getRawMany();
  }
}
