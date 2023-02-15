import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination } from '../common/object/pagination.object';
import { DeleteResult, FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { CreateGroupDTO, UpdateGroupDTO } from './group.dto';
import { Group } from './group.entity';
import { GroupFilter } from './group.filter';
import { TypeRelation } from '../common/object/filter';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>
  ) {}

  // eslint-disable-next-line prettier/prettier
  async findAll(pagination: Pagination, groupFilter: GroupFilter): Promise<[Group[], number]> {
    const groupFilterOption = {
      optionFilter: [
        { typeRelation: TypeRelation.Eq, fields: ['group_id'] },
        { typeRelation: TypeRelation.Ilike, fields: ['title', 'description'] }
      ]
    };

    const options: FindManyOptions = {
      skip: pagination.offset,
      take: pagination.limit,
      where: groupFilter.renderFilterOptionWhere([groupFilterOption])
    };
    return await this.groupRepository.findAndCount(options);
  }

  async findOne(group_id: string): Promise<Group> {
    return await this.groupRepository.findOneBy({ group_id: group_id });
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
}
