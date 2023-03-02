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
import { User } from '../../user/user.entity';
import { Group } from '../../group/group.entity';

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

  const group: Group = {
    group_id: '1',
    title: 'fake title',
    description: 'fake description',
    creation_date: new Date('2023-01-16 15:11:06.000')
  };

  const user: User = {
    user_id: '1',
    mail: 'fake@gmail.com',
    firstname: 'fake',
    lastname: 'fake',
    pseudo: 'fake',
    password: '',
    active: true,
    creation_date: new Date('2023-01-16 15:11:06.000')
  };

  const groupUser: GroupUser = {
    group_id: '1',
    user_id: '1',
    administrator: false,
    join_date: new Date('2023-01-16 15:11:06.000'),
    users: user,
    groups: group
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GroupUserService,
        UserService,
        GroupService,
        { useClass: mockRepository, provide: getRepositoryToken(GroupUser) },
        { useClass: mockRepository, provide: getRepositoryToken(User) },
        { useClass: mockRepository, provide: getRepositoryToken(Group) }
      ],
      controllers: [GroupUserController]
    }).compile();

    groupUserController = await moduleRef.resolve(GroupUserController);
    groupUserService = await moduleRef.resolve(GroupUserService);
    userService = await moduleRef.resolve(UserService);
    groupService = await moduleRef.resolve(GroupService);
  });

  describe('findAll', () => {
    it('findAll Group should return an array of User', async () => {
      const serviceResult: GroupUser[] = [];
      jest.spyOn(groupUserService, 'findAllUser').mockImplementation(async () => serviceResult);
      const result = await groupUserController.findAllGroup(groupUser.user_id);
      expect(result).toEqual(serviceResult);
    });

    it('findAll Group should return a not found exception', async () => {
      const exception = new ObjectNotFoundException('User not found with id : ' + user.user_id, 404);
      jest.spyOn(userService, 'findOne').mockImplementation(async () => null);

      try {
        await groupUserController.findAllGroup(user.user_id);
      } catch (e) {
        expect(e).toEqual(exception);
      }
    });

    it('findAll User should return an array of User', async () => {
      const serviceResult: GroupUser[] = [];
      jest.spyOn(groupUserService, 'findAllUser').mockImplementation(async () => serviceResult);
      const result = await groupUserController.findAllUser(groupUser.group_id);
      expect(result).toEqual(serviceResult);
    });

    it('findAll User should return a not found exception', async () => {
      const exception = new ObjectNotFoundException('Group not found with id : ' + group.group_id, 404);
      jest.spyOn(groupService, 'findOne').mockImplementation(async () => null);

      try {
        await groupUserController.findAllUser(group.group_id);
      } catch (e) {
        expect(e).toEqual(exception);
      }
    });
  });

  describe('create', () => {
    it('create should return created group', async () => {
      const result: ObjectResponseCreate<GroupUser> = new ObjectResponseCreate<GroupUser>(
        groupUser,
        'The user has been added successfully to the group'
      );

      const dto: CreateGroupUserDTO = {
        administrator: false,
        group_id: group.group_id,
        user_id: user.user_id
      };
      jest.spyOn(groupUserService, 'createUserGroup').mockImplementation(async () => groupUser);

      expect(await groupUserController.createUserGroup(groupUser.group_id, groupUser.user_id, dto)).toEqual(result);
    });

    it('create should return a not found exception', async () => {
      const exception = new ObjectNotFoundException('Group not found with id : ' + groupUser.group_id, 404);
      const dto: CreateGroupUserDTO = {
        administrator: false
      };
      jest.spyOn(groupService, 'findOne').mockImplementation(async () => null);

      try {
        await groupUserController.createUserGroup(groupUser.group_id, groupUser.user_id, dto);
      } catch (e) {
        expect(e).toEqual(exception);
      }
    });

    it('create should return a not found exception', async () => {
      const exception = new ObjectNotFoundException('User not found with id : ' + groupUser.user_id, 404);
      const dto: CreateGroupUserDTO = {
        administrator: false
      };
      jest.spyOn(userService, 'findOne').mockImplementation(async () => null);

      try {
        await groupUserController.createUserGroup(groupUser.group_id, groupUser.user_id, dto);
      } catch (e) {
        expect(e).toEqual(exception);
      }
    });
  });

  describe('update', () => {
    it('update should return an group_id and a successful message', async () => {
      const userGroupId: string = '{ group_id : ' + group.group_id + ', user_id : ' + user.user_id + ' }';
      const result: ObjectResponseUpdate = new ObjectResponseUpdate(userGroupId, 'The user group has been updated successfully');
      const dto: UpdateGroupUserDTO = {
        administrator: true,
        group_id: group.group_id,
        user_id: user.user_id
      };
      jest.spyOn(groupUserService, 'findOneUserGroup').mockImplementation(async () => groupUser);
      jest.spyOn(groupUserService, 'patchUserGroup').mockImplementation(async () => groupUser);

      expect(await groupUserController.UpdateUserGroup(groupUser.group_id, groupUser.user_id, dto)).toEqual(result);
    });

    it('update should return a not found exception', async () => {
      const exception = new ObjectNotFoundException('Group not found with id : ' + groupUser.group_id, 404);
      const dto: UpdateGroupUserDTO = {
        group_id: group.group_id,
        user_id: user.user_id,
        administrator: false
      };
      jest.spyOn(groupService, 'findOne').mockImplementation(async () => null);

      try {
        await groupUserController.UpdateUserGroup(groupUser.group_id, groupUser.user_id, dto);
      } catch (e) {
        expect(e).toEqual(exception);
      }
    });

    it('update should return a not found exception', async () => {
      const exception = new ObjectNotFoundException('User not found with id : ' + groupUser.user_id, 404);
      const dto: UpdateGroupUserDTO = {
        group_id: group.group_id,
        user_id: user.user_id,
        administrator: false
      };
      jest.spyOn(userService, 'findOne').mockImplementation(async () => null);

      try {
        await groupUserController.UpdateUserGroup(groupUser.group_id, groupUser.user_id, dto);
      } catch (e) {
        expect(e).toEqual(exception);
      }
    });

    it('update should return a not found exception', async () => {
      const exception = new ObjectNotFoundException('GroupUser not found with id : ' + user.user_id + ' and group id : ' + group.group_id, 404);
      const dto: UpdateGroupUserDTO = {
        group_id: group.group_id,
        user_id: user.user_id,
        administrator: false
      };
      jest.spyOn(groupUserService, 'findOneUserGroup').mockImplementation(async () => null);

      try {
        await groupUserController.UpdateUserGroup(group.group_id, user.user_id, dto);
      } catch (e) {
        expect(e).toEqual(exception);
      }
    });
  });

  describe('delete', () => {
    it('delete should return the group_id and a successful message of deletion', async () => {
      const userGroupId: string = '{ group_id : ' + group.group_id + ', user_id : ' + user.user_id + ' }';
      const result: ObjectResponseUpdate = new ObjectResponseUpdate(userGroupId, 'The user group has been deleted successfully');
      jest.spyOn(groupService, 'findOne').mockImplementation(async () => group);
      jest.spyOn(userService, 'findOne').mockImplementation(async () => user);
      jest.spyOn(groupUserService, 'findOneUserGroup').mockImplementation(async () => groupUser);
      jest.spyOn(groupUserService, 'deleteUserGroup').mockImplementation(async () => null);

      expect(await groupUserController.deleteUserGroup(group.group_id, user.user_id)).toEqual(result);
    });

    it('update should return a not found exception', async () => {
      const exception = new ObjectNotFoundException('Group not found with id : ' + groupUser.group_id, 404);
      const dto: UpdateGroupUserDTO = {
        group_id: group.group_id,
        user_id: user.user_id,
        administrator: false
      };
      jest.spyOn(groupService, 'findOne').mockImplementation(async () => null);

      try {
        await groupUserController.UpdateUserGroup(groupUser.group_id, groupUser.user_id, dto);
      } catch (e) {
        expect(e).toEqual(exception);
      }
    });

    it('update should return a not found exception', async () => {
      const exception = new ObjectNotFoundException('User not found with id : ' + groupUser.user_id, 404);
      const dto: UpdateGroupUserDTO = {
        group_id: group.group_id,
        user_id: user.user_id,
        administrator: false
      };
      jest.spyOn(userService, 'findOne').mockImplementation(async () => null);

      try {
        await groupUserController.UpdateUserGroup(groupUser.group_id, groupUser.user_id, dto);
      } catch (e) {
        expect(e).toEqual(exception);
      }
    });

    it('update should return a not found exception', async () => {
      const exception = new ObjectNotFoundException('GroupUser not found with id : ' + user.user_id + ' and group id : ' + group.group_id, 404);
      const dto: UpdateGroupUserDTO = {
        group_id: group.group_id,
        user_id: user.user_id,
        administrator: false
      };
      jest.spyOn(groupUserService, 'findOneUserGroup').mockImplementation(async () => null);

      try {
        await groupUserController.UpdateUserGroup(group.group_id, user.user_id, dto);
      } catch (e) {
        expect(e).toEqual(exception);
      }
    });
  });
});
