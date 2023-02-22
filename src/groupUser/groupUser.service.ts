import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Group } from '../group/group.entity';
import { User } from '../user/user.entity';
import { GroupUser } from './groupUser.entity';

@Injectable()
export class GroupUserService {
  constructor(
    @InjectRepository(GroupUser)
    private groupUserRepository: Repository<GroupUser>
  ) {}

  async findAllUser(groupId: string) {
    const options: FindManyOptions = {
      select: ['user_id', 'administrator', 'users.mail', 'users.firstname', 'users.lastname', 'users.pseudo'],
      relationLoadStrategy: 'query',
      relations: ['users'],
      where: { group_id: groupId }
    };
    return this.groupUserRepository.findAndCount(options);
  }

  async findAllGroup(userId: string) {
    const options: FindManyOptions = {
      //select: ['group_id', 'groups.title', 'groups.description'],
      relationLoadStrategy: 'query',
      relations: ['groups'],
      where: { user_id: userId }
    };
    return this.groupUserRepository.findAndCount(options);
  }
}
