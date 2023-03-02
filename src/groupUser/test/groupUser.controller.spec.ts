import { Test } from '@nestjs/testing';
import { Pagination } from '../../common/object/pagination.object';
import { ObjectResponseCreate } from '../../common/response/objectResponseCreate';
import { ObjectResponseUpdate } from '../../common/response/objectResponseUpdate';
import { ObjectNotFoundException } from '../../common/exception/objectNotFoundException';
import { ObjectResponseRecord } from '../../common/response/objectResponseRecord';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GroupUserService } from '../groupUser.service';
import { GroupUserController } from '../groupUser.controller';
import { GroupUser } from '../groupUser.entity';
import { CreateGroupUserDTO, UpdateGroupUserDTO } from '../groupUser.dto';
import { UserService } from '../../user/user.service';
import { GroupService } from '../../group/group.service';

export const mockRepository = jest.fn(() => ({
  metadata: {
    columns: [],
    relations: []
  }
}));

describe('GroupController', () => {
  let groupUserController: GroupUserController;
  let groupUserService: GroupUserService;
  let userService: UserService;
  let groupService: GroupService;

  const groupUser: GroupUser = {
    group_id: '1',
    user_id: '1',
    administrator: false,
    join_date: new Date('2023-01-16 15:11:06.000'),
    groups: []
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [GroupUserService, { useClass: mockRepository, provide: getRepositoryToken(GroupUser) }],
      controllers: [GroupUserController]
    }).compile();

    groupUserService = await moduleRef.resolve(GroupUserService);
    groupUserController = await moduleRef.resolve(GroupUserController);
  });

  describe('findAll', () => {
    it('findAll should return an array of User', async () => {
      const serviceResult: GroupUser[] = [];
      jest.spyOn(groupUserService, 'findAllUser').mockImplementation(async () => serviceResult);
      const result = await groupUserController.findAllGroup(groupUser.user_id);
      expect(result).toEqual(serviceResult);
    });

    it('findAll should return an array of User', async () => {
      const serviceResult: GroupUser[] = [];
      jest.spyOn(groupUserService, 'findAllUser').mockImplementation(async () => serviceResult);
      const result = await groupUserController.findAllUser(groupUser.group_id);
      expect(result).toEqual(serviceResult);
    });
  });

  describe('create', () => {
    it('create should return created group', async () => {
      const result: ObjectResponseCreate<Group> = new ObjectResponseCreate<GroupUser>(groupUser, 'The user has been added successfully to the group');

      const dto: CreateGroupUserDTO = {
        administrator: false
      };
      jest.spyOn(groupUserService, 'createUserGroup').mockImplementation(async () => groupUser);

      expect(await groupUserController.createUserGroup(groupUser.group_id, groupUser.user_id, dto)).toEqual(result);
    });
  });

  describe('update', () => {
    it('update should return an group_id and a successful message', async () => {
      const result: ObjectResponseUpdate = new ObjectResponseUpdate(group.group_id, 'The group has been updated successfully');
      const dto: UpdateGroupUserDTO = {
        administrator: false,
        group_id: groupUser.group_id,
        user_id: groupUser.user_id
      };
      jest.spyOn(groupUserService, 'findOneUserGroup').mockImplementation(async () => groupUser);
      jest.spyOn(groupUserService, 'patchUserGroup').mockImplementation(async () => groupUser);

      expect(await groupUserController.UpdateUserGroup(groupUser.group_id, groupUser.user_id, dto)).toEqual(result);
    });

    it('update should return a not found exception', async () => {
      const exception = new ObjectNotFoundException('Group not found with id : ' + groupUser.group_id, 404);
      const dto: UpdateGroupUserDTO = {
        group_id: groupUser.group_id,
        user_id: groupUser.user_id,
        administrator: false
      };
      jest.spyOn(groupService, 'findOne').mockImplementation(async () => null);

      try {
        await groupController.update(group.group_id, dto);
      } catch (e) {
        expect(e).toEqual(exception);
      }
    });

    it('update should return a not found exception', async () => {
      const exception = new ObjectNotFoundException('Group not found with id : ' + group.group_id, 404);
      const dto: UpdateGroupDTO = {
        group_id: group.group_id,
        title: 'fake title',
        description: 'fake description'
      };
      jest.spyOn(groupService, 'findOne').mockImplementation(async () => null);

      try {
        await groupController.update(group.group_id, dto);
      } catch (e) {
        expect(e).toEqual(exception);
      }
    });
  });

  describe('delete', () => {
    it('delete should return the group_id and a successful message of deletion', async () => {
      const result: ObjectResponseUpdate = new ObjectResponseUpdate(group.group_id, 'The group has been deleted successfully');
      jest.spyOn(groupService, 'findOne').mockImplementation(async () => group);
      jest.spyOn(groupService, 'delete').mockImplementation(async () => null);

      expect(await groupController.delete(group.group_id)).toEqual(result);
    });

    it('delete should return a not found exception', async () => {
      const exception = new ObjectNotFoundException('Group not found with id : ' + group.group_id, 404);
      jest.spyOn(groupService, 'findOne').mockImplementation(async () => null);

      try {
        await groupController.delete(group.group_id);
      } catch (e) {
        expect(e).toEqual(exception);
      }
    });
  });
});
