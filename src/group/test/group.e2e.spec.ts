import { INestApplication, ValidationError, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import * as request from 'supertest';
import { BadRequestExceptionValidation } from '../../common/exception/badRequestExceptionValidation';
import { Group } from '../group.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LIMIT } from '../../common/object/pagination.object';
import { BadRequestExceptionFilter } from '../../common/exception/badRequestExceptionFilter';
import { QueryFailedErrorException } from '../../common/exception/queryFailledErrorException';
import { CreateGroupDTO, UpdateGroupDTO } from '../group.dto';

describe('Group', () => {
  let app: INestApplication;
  let grouplist: Partial<Group>[] = [
    {
      title: 'fake1 title',
      description: 'fake1 description'
    },
    {
      title: 'fake2 title',
      description: 'fake2 description'
    },
    {
      title: 'fake3 title',
      description: 'fake3 description'
    },
    {
      title: 'fake4 title'
    },
    {
      title: 'fake5 title'
    }
  ];
  let groupRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        enableDebugMessages: true,
        transform: true,
        exceptionFactory: (validationErrors: ValidationError[] = []) => {
          return new BadRequestExceptionValidation(validationErrors);
        }
      })
    );
    app.useGlobalFilters(new BadRequestExceptionFilter(), new QueryFailedErrorException());
    await app.init();

    groupRepository = await moduleRef.get(getRepositoryToken(Group));
    for (let group of grouplist) {
      await groupRepository.save(group);
    }
  });

  describe('GetAll Group', () => {
    it('GetAll Group with no filter or pagination', async () => {
      const response = await request(app.getHttpServer()).get('/group');
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.count).toBeGreaterThan(0);
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBeGreaterThan(0);
    });

    it('GetAll Group with limit set manually', async () => {
      const limit = 5;
      const response = await request(app.getHttpServer()).get('/group?page[limit]=' + limit);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.count).toBeGreaterThan(0);
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBeLessThanOrEqual(limit);
    });

    it('GetAll Group with offset set manually', async () => {
      const offset = 4;
      const response = await request(app.getHttpServer()).get('/group?page[offset]=' + offset);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.count).toBeGreaterThan(0);
      expect(responseJson.records).toBeDefined();
    });

    it('GetAll Group with limit & offset set manually', async () => {
      const offset = 5;
      const limit = 5;
      const response = await request(app.getHttpServer()).get('/group?page[offset]=' + offset + '&page[limit]=' + limit);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.count).toBeGreaterThan(0);
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBeLessThanOrEqual(limit);
    });

    it('GetAll Group with filter description', async () => {
      const response = await request(app.getHttpServer()).get('/group?filter[description]=fake3 description');
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.records).toBeDefined();
      for (let record of responseJson.records) {
        expect(record.description).toBe('fake3 description');
      }
    });

    it('GetAll Group with filter title', async () => {
      const response = await request(app.getHttpServer()).get('/group?filter[title]=fake2 title');
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.records).toBeDefined();
      for (let record of responseJson.records) {
        expect(record.title).toBe('fake2 title');
      }
    });

    it('GetAll Group with filter', async () => {
      const response = await request(app.getHttpServer()).get('/group?filter[title]=fake1 title&filter[description]=fake1 description');
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.records).toBeDefined();
      for (let record of responseJson.records) {
        expect(record.title).toBe('fake1 title');
        expect(record.description).toMatch('fake1 description');
      }
    });

    it('GetAll Group with wrong title filter', async () => {
      const response = await request(app.getHttpServer()).get(
        '/group?filter[title]=ttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt'
      );
      expect(response.statusCode).toEqual(400);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Bad Request - Validation failed');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.length).toBeGreaterThan(0);
      expect(responseJson.data[0].fieldName).toBe('title');
      expect(responseJson.data[0].propertyErrors[0]).toBe('title must be shorter than or equal to 100 characters');
    });

    it('GetAll Group with wrong uuid filter', async () => {
      const response = await request(app.getHttpServer()).get('/group?filter[group_id]=11111');
      expect(response.statusCode).toEqual(400);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Bad Request - Validation failed');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.length).toBeGreaterThan(0);
      expect(responseJson.data[0].fieldName).toBe('group_id');
      expect(responseJson.data[0].propertyErrors[0]).toBe('group_id must be a UUID');
    });
  });

  describe('Get one group', () => {
    it('Get Group by id', async () => {
      const groupId = grouplist[0].group_id;
      const response = await request(app.getHttpServer()).get('/group/' + groupId);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.group_id).toBe(groupId);
    });

    it('Get Group with wrong id', async () => {
      const groupId = '39048102-0e9b-46c7-9dd6-de34169e3111';
      const response = await request(app.getHttpServer()).get('/group/' + groupId);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Group not found with id : 39048102-0e9b-46c7-9dd6-de34169e3111');
      expect(responseJson.path).toBe('/group/39048102-0e9b-46c7-9dd6-de34169e3111');
    });

    it('Get Group with wrong uuid format', async () => {
      const groupId = '39048102-0e9b-46c7-9dd6-de34169e3xxx';
      const response = await request(app.getHttpServer()).get('/group/' + groupId);
      expect(response.statusCode).toEqual(400);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Validation failed (uuid is expected)');
      expect(responseJson.error).toBe('Bad Request');
    });
  });

  describe('Create group', () => {
    const dto: CreateGroupDTO = {
      title: 'fake6 title',
      description: 'fake6 description'
    };

    it('create valid group', async () => {
      const response = await request(app.getHttpServer()).post('/group').send(dto);
      expect(response.statusCode).toEqual(201);
      const responseJson = response.body;
      grouplist.push(responseJson.record);

      expect(responseJson.message).toBe('The group has been created successfully');
      expect(responseJson.record).toBeDefined;
      expect(responseJson.record.title).toBe(dto.title);
      expect(responseJson.record.description).toBe(dto.description);
      expect(responseJson.record.group_id).not.toBeNull();
      expect(responseJson.record.creation_date).not.toBeNull();
    });
  });

  describe('Update group', () => {
    const dto: Partial<UpdateGroupDTO> = {
      title: 'fakeUpdate'
    };

    it('Update title for existing group', async () => {
      const group = grouplist[0];
      const response = await request(app.getHttpServer())
        .patch('/group/' + group.group_id)
        .send(dto);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.message).toBe('The group has been updated successfully');
      expect(responseJson.id).toBe(group.group_id);

      const responseGet = await request(app.getHttpServer()).get('/group/' + group.group_id);
      expect(responseGet.statusCode).toEqual(200);
      const responseGetJson = responseGet.body;
      expect(responseGetJson.title).toBe(dto.title);
    });

    it('Try to update non-existing group', async () => {
      const fakeId = '39048102-0e9b-46c7-9dd6-de34169e3111';
      const response = await request(app.getHttpServer())
        .patch('/group/' + fakeId)
        .send(dto);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Group not found with id : ' + fakeId);
      expect(responseJson.path).toBe('/group/' + fakeId);
    });
  });

  describe('delete group', () => {
    it('valid deletion of an group', async () => {
      const group = grouplist.pop();
      const response = await request(app.getHttpServer()).delete('/group/' + group.group_id);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.message).toBe('The group has been deleted successfully');
      expect(responseJson.id).toBe(group.group_id);
    });
    it('valid deletion of an group', async () => {
      const fakeId = '39048102-0e9b-46c7-9dd6-de34169e3111';
      const response = await request(app.getHttpServer()).delete('/group/' + fakeId);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Group not found with id : ' + fakeId);
      expect(responseJson.path).toBe('/group/' + fakeId);
    });
  });

  afterAll(async () => {
    for (let group of grouplist) {
      await groupRepository.delete(group.group_id);
    }
    await app.close();
  });
});
