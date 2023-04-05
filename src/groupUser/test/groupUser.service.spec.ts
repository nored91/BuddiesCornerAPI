import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../../app.module';
import { DeleteResult, Repository, SelectQueryBuilder } from 'typeorm';
import { GroupUser } from '../groupUser.entity';
import { GroupUserService } from '../groupUser.service';
import { User } from '../../user/user.entity';
import { Group } from '../../group/group.entity';

export const mockRepository = jest.fn(() => ({
  createQueryBuilder: jest.fn(() => ({
    select: () => jest.fn().mockReturnThis(),
    innerJoinAndSelect: () => jest.fn().mockReturnThis(),
    innerJoin: () => jest.fn().mockReturnThis(),
    leftJoinAndSelect: () => jest.fn().mockReturnThis(),
    leftJoin: () => jest.fn().mockReturnThis(),
    from: () => jest.fn().mockReturnThis(),
    where: () => jest.fn().mockReturnThis(),
    orWhere: () => jest.fn().mockReturnThis(),
    andWhere: () => jest.fn().mockReturnThis(),
    execute: () => jest.fn().mockReturnThis(),
    orderBy: () => jest.fn().mockReturnThis(),
    take: () => jest.fn().mockReturnThis(),
    skip: () => jest.fn().mockReturnThis(),
    getOne: () => jest.fn(),
    getRawMany: () => jest.fn().mockReturnValue([]),
    getManyAndCount: () => jest.fn()
  }))
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
      providers: [GroupUserService, { useClass: mockRepository, provide: getRepositoryToken(GroupUser) }]
    }).compile();
    groupUserService = await moduleRef.resolve(GroupUserService);
    groupUserRepository = await moduleRef.get(getRepositoryToken(GroupUser));
  });

  describe('findAll', () => {
    it('findAllUser should return an array of User', async () => {
      const TypeOrmResult: GroupUser[] = [];
      // const createQueryBuilder: SelectQueryBuilder<GroupUser> = {
      //   select: () => createQueryBuilder,
      //   leftJoin: () => createQueryBuilder,
      //   where: () => createQueryBuilder,
      //   getRawMany: async () => {
      //     return await test;
      //   }
      // };
      const result = await groupUserService.findAllUser(group.group_id);
      expect(result).toEqual(TypeOrmResult);
    });

    // it('findAllGroup should return an array of Group', async () => {
    //   const TypeOrmResult: GroupUser[] = [];
    //   jest.spyOn(groupUserRepository, 'createQueryBuilder').mockImplementationOnce(async () => TypeOrmResult);
    //   const result = await groupUserService.findAllGroup(user.user_id);
    //   expect(result).toEqual(TypeOrmResult);
    // });
  });

  // describe('findOne', () => {
  //   it('findOne should return one Group', async () => {
  //     const fakeId = group.group_id;
  //     jest.spyOn(groupRepository, 'findOneBy').mockImplementationOnce(async () => group);

  //     expect(await groupService.findOne(fakeId)).toBe(group);
  //   });
  // });

  // describe('create', () => {
  //   it('create should return created group', async () => {
  //     const dto: CreateGroupDTO = {
  //       title: 'fake title',
  //       description: 'fake description'
  //     };
  //     jest.spyOn(groupRepository, 'save').mockImplementationOnce(async () => group);
  //     jest.spyOn(groupRepository, 'findOneBy').mockImplementationOnce(async () => group);

  //     expect(await groupService.create(dto)).toEqual(group);
  //   });
  // });

  // describe('update', () => {
  //   it('update should return group_id a successful message', async () => {
  //     const dto: UpdateGroupDTO = {
  //       group_id: group.group_id,
  //       title: 'fake title',
  //       description: 'fake description'
  //     };
  //     jest.spyOn(groupRepository, 'save').mockImplementationOnce(async () => group);

  //     expect(await groupService.patch(dto)).toEqual(group);
  //   });
  // });

  // describe('delete', () => {
  //   it('delete should be called succesfully', async () => {
  //     const result: DeleteResult = { raw: 1, affected: 1 };
  //     jest.spyOn(groupRepository, 'delete').mockImplementationOnce(async () => result);

  //     expect(await groupService.delete({ group_id: group.group_id })).toEqual(result);
  //   });
  // });
});
