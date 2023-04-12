import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../../app.module';
import { DeleteResult, FindOneOptions, Repository, SelectQueryBuilder } from 'typeorm';
import { GroupUser } from '../groupUser.entity';
import { GroupUserService } from '../groupUser.service';
import { User } from '../../user/user.entity';
import { Group } from '../../group/group.entity';
import { CreateGroupUserDTO, UpdateGroupUserDTO } from '../groupUser.dto';

export const groupUserList: GroupUser[] = [];

export const mockRepository = jest.fn(() => ({
  createQueryBuilder: jest.fn(() => ({
    select: () => jest.fn().mockReturnThis(),
    leftJoin: () => jest.fn().mockReturnThis(),
    where: () => jest.fn().mockReturnThis(),
    getRawMany: () => jest.fn().mockReturnValue([GroupUser])
  })),
  findOne: jest.fn().mockReturnThis(),
  save: () => jest.fn().mockReturnThis(),
  delete: () => jest.fn().mockReturnThis()
}));

describe('groupService', () => {
  let groupUserRepository: Repository<GroupUser>;
  let groupUserService: GroupUserService;

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

  const user2: User = {
    user_id: '2',
    mail: 'fake2@gmail.com',
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

  const groupUser2: GroupUser = {
    group_id: '1',
    user_id: '2',
    administrator: true,
    join_date: new Date('2023-01-16 15:11:06.000'),
    users: user2,
    groups: group
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [GroupUserService, { useClass: mockRepository, provide: getRepositoryToken(GroupUser) }]
    }).compile();
    groupUserService = await moduleRef.resolve(GroupUserService);
    groupUserRepository = await moduleRef.get(getRepositoryToken(GroupUser));
  });

  describe('findAll', () => {
    it('findAllUser should return an array of GroupUser', async () => {
      const TypeOrmResult: GroupUser[] = [];
      const createQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([])
      };
      jest.spyOn(groupUserRepository, 'createQueryBuilder').mockImplementation(() => createQueryBuilder);
      const result = await groupUserService.findAllUser(group.group_id);
      expect(result).toEqual(TypeOrmResult);
    });

    it('findAllGroup should return an array of GroupUser', async () => {
      const TypeOrmResult: GroupUser[] = [];
      const createQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([])
      };
      jest.spyOn(groupUserRepository, 'createQueryBuilder').mockImplementation(() => createQueryBuilder);
      const result = await groupUserService.findAllUser(user.user_id);
      expect(result).toEqual(TypeOrmResult);
    });
  });

  describe('findOneGroupUser', () => {
    it('findOne should return one GroupUser', async () => {
      const fakeGroupId = group.group_id;
      const fakeUserId = user.user_id;
      jest.spyOn(groupUserRepository, 'findOne').mockImplementationOnce(async () => groupUser);
      expect(await groupUserService.findOneGroupUser(fakeGroupId, fakeUserId)).toBe(groupUser);
    });
  });

  describe('create', () => {
    it('create should return created groupUser', async () => {
      const dto: CreateGroupUserDTO = {
        administrator: false,
        group_id: group.group_id,
        user_id: user.user_id
      };
      jest.spyOn(groupUserRepository, 'save').mockImplementationOnce(async () => groupUser);
      jest.spyOn(groupUserRepository, 'findOne').mockImplementationOnce(async () => groupUser);
      expect(await groupUserService.createGroupUser(dto)).toEqual(groupUser);
    });
  });

  describe('update', () => {
    it('update should return groupUser updated', async () => {
      const dto: UpdateGroupUserDTO = {
        administrator: true,
        group_id: group.group_id,
        user_id: user2.user_id
      };
      jest.spyOn(groupUserRepository, 'save').mockImplementationOnce(async () => groupUser2);

      expect(await groupUserService.patchGroupUser(dto)).toEqual(groupUser2);
    });
  });

  describe('delete', () => {
    it('delete return a deleteResult', async () => {
      const result: DeleteResult = { raw: 1, affected: 1 };
      jest.spyOn(groupUserRepository, 'delete').mockImplementationOnce(async () => result);
      expect(await groupUserService.deleteGroupUser({ group_id: group.group_id, user_id: user.user_id })).toEqual(result);
    });
  });
});
