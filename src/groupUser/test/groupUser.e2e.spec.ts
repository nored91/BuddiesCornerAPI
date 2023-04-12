import { INestApplication, ValidationError, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import * as request from 'supertest';
import { BadRequestExceptionValidation } from '../../common/exception/badRequestExceptionValidation';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LIMIT } from '../../common/object/pagination.object';
import { BadRequestExceptionFilter } from '../../common/exception/badRequestExceptionFilter';
import { QueryFailedErrorException } from '../../common/exception/queryFailledErrorException';
import { User } from '../../user/user.entity';
import { GroupUser } from '../groupUser.entity';
import { Group } from '../../group/group.entity';
import { CreateGroupUserDTO, UpdateGroupUserDTO } from '../groupUser.dto';
import { FindOptionsWhere } from 'typeorm';

describe('GroupUser', () => {
  let app: INestApplication;
  let groupsavelist: Group[] = [];
  let usersavelist: User[] = [];

  let grouplist: Partial<Group>[] = [
    {
      title: 'fake1 title',
      description: 'fake1 description'
    },
    {
      title: 'fake2 title',
      description: 'fake2 description'
    }
  ];
  let userlist: Partial<User>[] = [
    {
      mail: 'fake1@gmail.com',
      firstname: 'fake',
      lastname: 'fake',
      pseudo: 'fakeForTestEndToEnd',
      password: 'fake'
    },
    {
      mail: 'fake2@gmail.com',
      firstname: 'fake',
      lastname: 'fake',
      pseudo: 'fakeForTestEndToEnd',
      password: 'fake'
    },
    {
      mail: 'fake3@gmail.com',
      firstname: 'fake',
      lastname: 'fake',
      pseudo: 'fakeForTestEndToEnd',
      password: 'fake'
    }
  ];

  let groupUserlist: Partial<GroupUser>[] = [
    {
      group_id: grouplist[0].group_id,
      user_id: userlist[0].user_id,
      administrator: true,
      join_date: new Date('2023-01-16 15:11:06.000'),
      groups: null,
      users: null
    },
    {
      group_id: grouplist[0].group_id,
      user_id: userlist[1].user_id,
      administrator: true,
      join_date: new Date('2023-01-16 15:11:06.000'),
      groups: null,
      users: null
    },
    {
      group_id: grouplist[1].group_id,
      user_id: userlist[0].user_id,
      administrator: true,
      join_date: new Date('2023-01-16 15:11:06.000'),
      groups: null,
      users: null
    }
  ];

  let groupRepository;
  let userRepository;
  let groupUserRepository;

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
      groupsavelist.push(await groupRepository.save(group));
    }
    userRepository = await moduleRef.get(getRepositoryToken(User));
    for (let user of userlist) {
      usersavelist.push(await userRepository.save(user));
    }

    groupUserlist[0].group_id = grouplist[0].group_id;
    groupUserlist[0].groups = groupsavelist[0];

    groupUserlist[1].group_id = grouplist[0].group_id;
    groupUserlist[1].groups = groupsavelist[0];

    groupUserlist[2].group_id = grouplist[1].group_id;
    groupUserlist[2].groups = groupsavelist[1];

    groupUserlist[0].user_id = userlist[0].user_id;
    groupUserlist[0].users = usersavelist[0];

    groupUserlist[1].user_id = userlist[1].user_id;
    groupUserlist[1].users = usersavelist[1];

    groupUserlist[2].user_id = userlist[0].user_id;
    groupUserlist[2].users = usersavelist[0];

    groupUserRepository = await moduleRef.get(getRepositoryToken(GroupUser));
    for (let groupUser of groupUserlist) {
      await groupUserRepository.save(groupUser);
    }
  });

  describe('GetAll GroupUser', () => {
    it('GetAll User from GroupUser', async () => {
      const groupId = grouplist[0].group_id;
      const response = await request(app.getHttpServer()).get('/group/' + groupId + '/user');
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson[0].user_id).toBe(userlist[0].user_id);
      expect(responseJson[0].user_firstname).toBe(userlist[0].firstname);
      expect(responseJson[0].user_lastname).toBe(userlist[0].lastname);
      expect(responseJson[1].user_id).toBe(userlist[1].user_id);
      expect(responseJson[1].user_firstname).toBe(userlist[1].firstname);
      expect(responseJson[1].user_lastname).toBe(userlist[1].lastname);
    });

    it('GetAll User from GroupUser with wrong id', async () => {
      const groupId = '39048102-0e9b-46c7-9dd6-de34169e3111';
      const response = await request(app.getHttpServer()).get('/group/' + groupId + '/user');
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Group not found with id : 39048102-0e9b-46c7-9dd6-de34169e3111');
      expect(responseJson.path).toBe('/group/39048102-0e9b-46c7-9dd6-de34169e3111/user');
    });

    it('GetAll User from GroupUser with wrong uuid format', async () => {
      const groupId = '39048102-0e9b-46c7-9dd6-de34169e3xxx';
      const response = await request(app.getHttpServer()).get('/group/' + groupId + '/user');
      expect(response.statusCode).toEqual(400);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Validation failed (uuid is expected)');
      expect(responseJson.error).toBe('Bad Request');
    });

    it('GetAll Group from GroupUser', async () => {
      const userId = userlist[0].user_id;
      const response = await request(app.getHttpServer()).get('/user/' + userId + '/group');
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson[0].group_id).toBe(grouplist[0].group_id);
      expect(responseJson[0].group_title).toBe(grouplist[0].title);
      expect(responseJson[1].group_id).toBe(grouplist[1].group_id);
      expect(responseJson[1].group_title).toBe(grouplist[1].title);
    });

    it('GetAll Group from GroupUser with wrong id', async () => {
      const userId = '39048102-0e9b-46c7-9dd6-de34169e3111';
      const response = await request(app.getHttpServer()).get('/user/' + userId + '/group');
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.message).toBe('User not found with id : 39048102-0e9b-46c7-9dd6-de34169e3111');
      expect(responseJson.path).toBe('/user/39048102-0e9b-46c7-9dd6-de34169e3111/group');
    });

    it('GetAll Group from GroupUser with wrong uuid format', async () => {
      const userId = '39048102-0e9b-46c7-9dd6-de34169e3xxx';
      const response = await request(app.getHttpServer()).get('/user/' + userId + '/group');
      expect(response.statusCode).toEqual(400);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Validation failed (uuid is expected)');
      expect(responseJson.error).toBe('Bad Request');
    });
  });

  describe('Create group', () => {
    const groupUserDTO: CreateGroupUserDTO = {
      administrator: false
    };

    const groupUserFalseDTO = {
      administrator: 'test',
      group_id: grouplist[1].group_id,
      user_id: userlist[1].user_id
    };

    it('create valid groupUser', async () => {
      const groupId = grouplist[1].group_id;
      const userId = userlist[1].user_id;
      const response = await request(app.getHttpServer())
        .post('/group/' + groupId + '/user/' + userId)
        .send(groupUserDTO);
      expect(response.statusCode).toEqual(201);
      const responseJson = response.body;
      groupUserlist.push(responseJson.record);
      expect(responseJson.message).toBe('The user has been added successfully to the group');
      expect(responseJson.record).toBeDefined;
      expect(responseJson.record.group_id).toBe(groupId);
      expect(responseJson.record.user_id).toBe(userId);
      expect(responseJson.record.administrator).toBe(groupUserDTO.administrator);
      expect(responseJson.record.join_date).not.toBeNull();
    });

    it('create wrong groupUser', async () => {
      const groupId = grouplist[1].group_id;
      const userId = userlist[1].user_id;
      const response = await request(app.getHttpServer())
        .post('/group/' + groupId + '/user/' + userId)
        .send(groupUserFalseDTO);
      expect(response.statusCode).toEqual(400);
      const responseJson = response.body;
      console.log(responseJson);
      expect(responseJson.message).toBe('Bad Request - Validation failed');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.length).toBeGreaterThan(0);
      expect(responseJson.data[0].fieldName).toBe('administrator');
      expect(responseJson.data[0].propertyErrors[0]).toBe('administrator must be a boolean value');
    });

    it('create groupUser with wrong group id', async () => {
      const groupId = 'a812fb4e-c477-44b8-aa6f-fe221e5a0861';
      const userId = userlist[1].user_id;
      const response = await request(app.getHttpServer())
        .post('/group/' + groupId + '/user/' + userId)
        .send(groupUserDTO);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Group not found with id : ' + groupId);
      expect(responseJson.path).toBe('/group/' + groupId + '/user/' + userId);
    });

    it('create groupUser with wrong user id', async () => {
      const groupId = grouplist[1].group_id;
      const userId = 'a812fb4e-c477-44b8-aa6f-fe221e5a0861';
      const response = await request(app.getHttpServer())
        .post('/group/' + groupId + '/user/' + userId)
        .send(groupUserDTO);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.message).toBe('User not found with id : ' + userId);
      expect(responseJson.path).toBe('/group/' + groupId + '/user/' + userId);
    });
  });

  describe('Update groupUser', () => {
    const groupUserDTO: UpdateGroupUserDTO = {
      administrator: true,
      group_id: grouplist[1].group_id,
      user_id: userlist[1].user_id
    };

    const groupUserFalseDTO = {
      administrator: 'test',
      group_id: grouplist[1].group_id,
      user_id: userlist[1].user_id
    };

    it('update valid groupUser', async () => {
      const groupId = grouplist[1].group_id;
      const userId = userlist[1].user_id;
      const response = await request(app.getHttpServer())
        .patch('/group/' + groupId + '/user/' + userId)
        .send(groupUserDTO);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.message).toBe('The user group has been updated successfully');
      expect(responseJson.id).toBe('{ group_id : ' + groupId + ', user_id : ' + userId + ' }');
    });

    it('update wrong groupUser', async () => {
      const groupId = grouplist[1].group_id;
      const userId = userlist[1].user_id;
      const response = await request(app.getHttpServer())
        .patch('/group/' + groupId + '/user/' + userId)
        .send(groupUserFalseDTO);
      expect(response.statusCode).toEqual(400);
      const responseJson = response.body;
      console.log(responseJson);

      expect(responseJson.message).toBe('Bad Request - Validation failed');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.length).toBeGreaterThan(0);
      expect(responseJson.data[0].fieldName).toBe('administrator');
      expect(responseJson.data[0].propertyErrors[0]).toBe('administrator must be a boolean value');
    });

    it('update groupUser with wrong group id', async () => {
      const groupId = 'a812fb4e-c477-44b8-aa6f-fe221e5a0861';
      const userId = userlist[1].user_id;
      const response = await request(app.getHttpServer())
        .patch('/group/' + groupId + '/user/' + userId)
        .send(groupUserDTO);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Group not found with id : ' + groupId);
      expect(responseJson.path).toBe('/group/' + groupId + '/user/' + userId);
    });

    it('update groupUser with wrong user id', async () => {
      const groupId = grouplist[1].group_id;
      const userId = 'a812fb4e-c477-44b8-aa6f-fe221e5a0861';
      const response = await request(app.getHttpServer())
        .patch('/group/' + groupId + '/user/' + userId)
        .send(groupUserDTO);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.message).toBe('User not found with id : ' + userId);
      expect(responseJson.path).toBe('/group/' + groupId + '/user/' + userId);
    });

    it('update groupUser with wrong group user id', async () => {
      const groupId = grouplist[1].group_id;
      const userId = userlist[2].user_id;
      const response = await request(app.getHttpServer())
        .patch('/group/' + groupId + '/user/' + userId)
        .send(groupUserDTO);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.message).toBe('GroupUser not found with user id : ' + userId + ' and group id : ' + groupId);
      expect(responseJson.path).toBe('/group/' + groupId + '/user/' + userId);
    });
  });

  describe('Delete groupUser', () => {
    it('Delete valid groupUser', async () => {
      const groupUser = groupUserlist.pop();
      const groupId = groupUser.group_id;
      const userId = groupUser.user_id;
      const response = await request(app.getHttpServer()).delete('/group/' + groupId + '/user/' + userId);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.message).toBe('The user group has been deleted successfully');
      expect(responseJson.id).toBe('{ group_id : ' + groupId + ', user_id : ' + userId + ' }');
    });

    it('Delete groupUser with wrong group id', async () => {
      const groupId = 'a812fb4e-c477-44b8-aa6f-fe221e5a0861';
      const userId = userlist[1].user_id;
      const response = await request(app.getHttpServer()).delete('/group/' + groupId + '/user/' + userId);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Group not found with id : ' + groupId);
      expect(responseJson.path).toBe('/group/' + groupId + '/user/' + userId);
    });

    it('Delete groupUser with wrong user id', async () => {
      const groupId = grouplist[1].group_id;
      const userId = 'a812fb4e-c477-44b8-aa6f-fe221e5a0861';
      const response = await request(app.getHttpServer()).delete('/group/' + groupId + '/user/' + userId);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.message).toBe('User not found with id : ' + userId);
      expect(responseJson.path).toBe('/group/' + groupId + '/user/' + userId);
    });

    it('Delete groupUser with wrong group user id', async () => {
      const groupId = grouplist[1].group_id;
      const userId = userlist[2].user_id;
      const response = await request(app.getHttpServer()).delete('/group/' + groupId + '/user/' + userId);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.message).toBe('GroupUser not found with user id : ' + userId + ' and group id : ' + groupId);
      expect(responseJson.path).toBe('/group/' + groupId + '/user/' + userId);
    });
  });

  afterAll(async () => {
    for (let groupUser of groupUserlist) {
      let option: FindOptionsWhere<GroupUser> = { group_id: groupUser.group_id, user_id: groupUser.user_id };
      await groupUserRepository.delete(option);
    }
    for (let user of userlist) {
      let option: FindOptionsWhere<User> = { user_id: user.user_id };
      await userRepository.delete(option);
    }
    for (let group of grouplist) {
      let option: FindOptionsWhere<Group> = { group_id: group.group_id };
      await groupRepository.delete(option);
    }
    await app.close();
  });
});
