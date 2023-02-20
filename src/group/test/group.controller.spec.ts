import { GroupController } from '../group.controller';
import { GroupService } from '../group.service';
import { Test } from '@nestjs/testing';
import { Pagination } from '../../common/object/pagination.object';
import { Group } from '../group.entity';
import { GroupFilter } from '../group.filter';
import { ObjectResponseCreate } from '../../common/response/objectResponseCreate';
import { CreateGroupDTO, UpdateGroupDTO } from '../group.dto';
import { ObjectResponseUpdate } from '../../common/response/objectResponseUpdate';
import { ObjectNotFoundException } from '../../common/exception/objectNotFoundException';
import { ObjectResponseRecord } from '../../common/response/objectResponseRecord';
import { getRepositoryToken } from '@nestjs/typeorm';

export const mockRepository = jest.fn(() => ({
  metadata: {
    columns: [],
    relations: []
  }
}));

describe('GroupController', () => {
  let groupController: GroupController;
  let groupService: GroupService;

  const group: Group = {
    group_id: '1',
    title: 'fake title',
    description: 'fake description',
    creation_date: new Date('2023-01-16 15:11:06.000'),
    users: []
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [GroupService, { useClass: mockRepository, provide: getRepositoryToken(Group) }],
      controllers: [GroupController]
    }).compile();

    groupService = await moduleRef.resolve(GroupService);
    groupController = await moduleRef.resolve(GroupController);
  });

  describe('findAll', () => {
    it('findAll should return an array of Group', async () => {
      const pagination: Pagination = { limit: 1, offset: 0 };
      const queryFilter: GroupFilter = new GroupFilter();
      const serviceResult: [Group[], number] = [[], 0];
      const controllerResult: ObjectResponseRecord<Group> = new ObjectResponseRecord<Group>(serviceResult);
      jest.spyOn(groupService, 'findAll').mockImplementation(async () => serviceResult);
      const result = await groupController.findAll(pagination, queryFilter);

      expect(result).toEqual(controllerResult);
      expect(controllerResult.getRecords()).toBe(serviceResult[0]);
      expect(controllerResult.getCount()).toBe(serviceResult[1]);
    });
  });

  describe('findOne', () => {
    it('findOne should return one Group', async () => {
      const fakeId = group.group_id;
      jest.spyOn(groupService, 'findOne').mockImplementation(async () => group);

      expect(await groupController.findOne(fakeId)).toBe(group);
    });

    it('findOne should return a not found exception', async () => {
      const fakeId = group.group_id;
      const exception = new ObjectNotFoundException('Group not found with id : ' + group.group_id, 404);
      jest.spyOn(groupService, 'findOne').mockImplementation(async () => null);
      try {
        await groupController.findOne(fakeId);
      } catch (e) {
        expect(e).toEqual(exception);
      }
    });
  });

  describe('create', () => {
    it('create should return created group', async () => {
      const result: ObjectResponseCreate<Group> = new ObjectResponseCreate<Group>(group, 'The group has been created successfully');

      const dto: CreateGroupDTO = {
        title: 'fake title',
        description: 'fake description'
      };
      jest.spyOn(groupService, 'create').mockImplementation(async () => group);

      expect(await groupController.create(dto)).toEqual(result);
    });
  });

  describe('update', () => {
    it('update should return an group_id and a successful message', async () => {
      const result: ObjectResponseUpdate = new ObjectResponseUpdate(group.group_id, 'The group has been updated successfully');
      const dto: UpdateGroupDTO = {
        group_id: group.group_id,
        title: 'fake title',
        description: 'fake description'
      };
      jest.spyOn(groupService, 'findOne').mockImplementation(async () => group);
      jest.spyOn(groupService, 'patch').mockImplementation(async () => group);

      expect(await groupController.update(group.group_id, dto)).toEqual(result);
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
