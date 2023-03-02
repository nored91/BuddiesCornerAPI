import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../../app.module';
import { DeleteResult, Repository } from 'typeorm';
import { Pagination } from '../../common/object/pagination.object';
import { Group } from '../group.entity';
import { GroupFilter } from '../group.filter';
import { GroupService } from '../group.service';
import { CreateGroupDTO, UpdateGroupDTO } from '../group.dto';

describe('groupService', () => {
  let groupRepository: Repository<Group>;
  let groupService: GroupService;

  const group: Group = {
    group_id: '1',
    title: 'fake title',
    description: 'fake description',
    creation_date: new Date('2023-02-14 15:11:06.000')
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    groupService = await moduleRef.resolve(GroupService);
    groupRepository = await moduleRef.get(getRepositoryToken(Group));
  });

  describe('findAll', () => {
    it('findAll should return an array of Group', async () => {
      const pagination: Pagination = { limit: 1, offset: 0 };
      const queryFilter: GroupFilter = new GroupFilter();
      const TypeOrmResult: [Group[], number] = [[group], 1];
      jest.spyOn(groupRepository, 'findAndCount').mockImplementationOnce(async () => TypeOrmResult);
      const result = await groupService.findAll(pagination, queryFilter);

      expect(result).toEqual(TypeOrmResult);
    });
  });

  describe('findOne', () => {
    it('findOne should return one Group', async () => {
      const fakeId = group.group_id;
      jest.spyOn(groupRepository, 'findOneBy').mockImplementationOnce(async () => group);

      expect(await groupService.findOne(fakeId)).toBe(group);
    });
  });

  describe('create', () => {
    it('create should return created group', async () => {
      const dto: CreateGroupDTO = {
        title: 'fake title',
        description: 'fake description'
      };
      jest.spyOn(groupRepository, 'save').mockImplementationOnce(async () => group);
      jest.spyOn(groupRepository, 'findOneBy').mockImplementationOnce(async () => group);

      expect(await groupService.create(dto)).toEqual(group);
    });
  });

  describe('update', () => {
    it('update should return group_id a successful message', async () => {
      const dto: UpdateGroupDTO = {
        group_id: group.group_id,
        title: 'fake title',
        description: 'fake description'
      };
      jest.spyOn(groupRepository, 'save').mockImplementationOnce(async () => group);

      expect(await groupService.patch(dto)).toEqual(group);
    });
  });

  describe('delete', () => {
    it('delete should be called succesfully', async () => {
      const result: DeleteResult = { raw: 1, affected: 1 };
      jest.spyOn(groupRepository, 'delete').mockImplementationOnce(async () => result);

      expect(await groupService.delete({ group_id: group.group_id })).toEqual(result);
    });
  });
});
