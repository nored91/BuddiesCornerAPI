import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, FindManyOptions, FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { Group } from '../group/group.entity';
import { User } from '../user/user.entity';
import { CreateGroupUserDTO, UpdateGroupUserDTO } from './groupUser.dto';
import { GroupUser } from './groupUser.entity';

@Injectable()
export class GroupUserService {
  constructor(
    @InjectRepository(GroupUser)
    private groupUserRepository: Repository<GroupUser>
  ) {}

  async findAllUser(groupId: string): Promise<GroupUser[]> {
    return await this.groupUserRepository
      .createQueryBuilder('groupUser')
      .select(['administrator', 'join_date', 'user.user_id as user_id', 'user.firstname', 'user.lastname', 'user.mail', 'user.pseudo'])
      .leftJoin('groupUser.users', 'user')
      .where('groupUser.group_id = :groupId', { groupId: groupId })
      .getRawMany<GroupUser>();
  }

  async findAllGroup(userId: string): Promise<GroupUser[]> {
    return await this.groupUserRepository
      .createQueryBuilder('groupUser')
      .select(['group.group_id as group_id', 'group.title', 'group.description'])
      .leftJoin('groupUser.groups', 'group')
      .where('groupUser.user_id = :userId', { userId: userId })
      .getRawMany<GroupUser>();
  }

  async findOneUserGroup(group_id: string, user_id: string): Promise<GroupUser> {
    let option: FindOneOptions = { where: { group_id: group_id, user_id: user_id } };
    return await this.groupUserRepository.findOne(option);
  }

  async createUserGroup(createGroupUserDTO: CreateGroupUserDTO) {
    const groupUser = await this.groupUserRepository.save(createGroupUserDTO);
    return await this.findOneUserGroup(groupUser.group_id, groupUser.user_id);
  }

  async patchUserGroup(updateGroupUserDTO: UpdateGroupUserDTO) {
    return await this.groupUserRepository.save(updateGroupUserDTO);
  }

  async deleteUserGroup(group_id: string, user_id: string): Promise<DeleteResult> {
    let option: FindOptionsWhere<GroupUser> = { group_id: group_id, user_id: user_id };
    return this.groupUserRepository.delete(option);
  }
}
