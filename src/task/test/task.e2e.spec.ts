import { INestApplication, ValidationError, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import * as request from 'supertest';
import { BadRequestExceptionValidation } from '../../common/exception/badRequestExceptionValidation';
import { Task } from '../task.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LIMIT } from '../../common/object/pagination.object';
import { BadRequestExceptionFilter } from '../../common/exception/badRequestExceptionFilter';
import { QueryFailedErrorException } from '../../common/exception/queryFailledErrorException';
import { CreateTaskDTO, UpdateTaskDTO } from '../task.dto';
import { Event, EventType } from '../../event/event.entity';
import { Repository } from 'typeorm/repository/Repository';
import { User } from '../../user/user.entity';
import { Group } from '../../group/group.entity';

describe('Task', () => {
  let app: INestApplication;
  let eventRepository: Repository<Event>;
  let taskRepository: Repository<Task>;
  let userRepository: Repository<User>;
  let groupRepository: Repository<Group>;
  let eventForTask: Event = null;
  let userForTask: User = null;
  let groupForTask: Group = null;

  let groupPartialForTask: Partial<Group> = {
    title: 'fake group for fake event'
  };

  let eventPartialForTask: Partial<Event> = {
    title: 'fake event for fake task',
    description: 'fake description for test task',
    type: EventType.sport
  };

  let userPartialForTask: Partial<User> = {
    mail: 'fakeTaskUser@gmail.com',
    firstname: 'fakeUserForTask',
    lastname: 'fake',
    pseudo: 'fakeForTestEndToEnd',
    password: 'fake',
    active: true
  };

  let tasklist: Partial<Task>[] = [
    { title: 'Fake task - apporter à manger' },
    { title: 'Fake task - rembourser toto' },
    { title: 'Fake task - faire la lessive' }
  ];

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

    eventRepository = await moduleRef.get(getRepositoryToken(Event));
    userRepository = await moduleRef.get(getRepositoryToken(User));
    taskRepository = await moduleRef.get(getRepositoryToken(Task));
    groupRepository = await moduleRef.get(getRepositoryToken(Group));

    userForTask = await userRepository.save(userPartialForTask);
    groupForTask = await groupRepository.save(groupPartialForTask);
    eventPartialForTask.group = groupForTask;
    eventPartialForTask.creator_user = userForTask;
    eventForTask = await eventRepository.save(eventPartialForTask);

    for (let task of tasklist) {
      task.event = eventForTask;
      task.user = userForTask;
      await taskRepository.save(task);
    }
  });

  describe('GetAll Task', () => {
    it('GetAll Task with no filter or pagination', async () => {
      const response = await request(app.getHttpServer()).get('/task');
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.count).toBeGreaterThan(0);
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBeGreaterThan(0);
    });

    it('GetAll Task with limit set manually', async () => {
      const limit = 5;
      const response = await request(app.getHttpServer()).get('/task?page[limit]=' + limit);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.count).toBeGreaterThan(0);
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBeLessThanOrEqual(limit);
    });

    it('GetAll Task with offset set manually', async () => {
      const offset = 2;
      const response = await request(app.getHttpServer()).get('/task?page[offset]=' + offset);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.count).toBeGreaterThan(0);
      expect(responseJson.records).toBeDefined();
    });

    it('GetAll Task with limit & offset set manually', async () => {
      const offset = 2;
      const limit = 4;
      const response = await request(app.getHttpServer()).get('/task?page[offset]=' + offset + '&page[limit]=' + limit);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.count).toBeGreaterThan(0);
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBeLessThanOrEqual(limit);
    });

    it('GetAll Task with filter and default limit', async () => {
      const response = await request(app.getHttpServer()).get('/task?filter[title]=Fake task - apporter à manger');
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBeLessThanOrEqual(LIMIT);
      for (let record of responseJson.records) {
        expect(record.title).toBe('Fake task - apporter à manger');
      }
    });

    it('GetAll Task with filter on user firstname', async () => {
      const response = await request(app.getHttpServer()).get('/task?filter[title]=fake task&filter[user][firstname]=fakeUserForTask');
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBe(3);
      for (let record of responseJson.records) {
        expect(record.user.firstname).toBe('fakeUserForTask');
        expect(record.user.user_id).toMatch(userForTask.user_id);
      }
    });

    it('GetAll Task with filter on event title', async () => {
      const response = await request(app.getHttpServer()).get('/task?filter[event][title]=fake event for fake task');
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBe(3);
      for (let record of responseJson.records) {
        expect(record.event.title).toBe('fake event for fake task');
        expect(record.event.event_id).toMatch(eventForTask.event_id);
      }
    });

    it('GetAll Task with filter on achieve', async () => {
      const response = await request(app.getHttpServer()).get('/task?filter[user][firstname]=fakeUserForTask&filter[achieve]=false');
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.records).toBeDefined();
      for (let record of responseJson.records) {
        expect(record.achieve).toBe(false);
        expect(record.user.user_id).toMatch(userForTask.user_id);
      }
    });

    it('GetAll Task with wrong boolean value', async () => {
      const response = await request(app.getHttpServer()).get('/task?filter[user][firstname]=fakeUserForTask&filter[achieve]=TRUE');
      expect(response.statusCode).toEqual(400);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Bad Request - Validation failed');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.length).toBeGreaterThan(0);
      expect(responseJson.data[0].fieldName).toBe('achieve');
      expect(responseJson.data[0].propertyErrors[0]).toBe('achieve must be a boolean value');
    });

    it('GetAll Task with bad request exception because user_id is incorrect', async () => {
      const response = await request(app.getHttpServer()).get('/task?filter[user][user_id]=1234567');
      expect(response.statusCode).toEqual(400);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Bad Request - Validation failed');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.length).toBeGreaterThan(0);
      expect(responseJson.data[0].fieldName).toBe('user_id');
      expect(responseJson.data[0].propertyErrors[0]).toBe('user_id must be a UUID');
    });

    it('GetAll Task with bad request exception because user pseudo is not part of authorized filter', async () => {
      const response = await request(app.getHttpServer()).get('/task?filter[user][pseudo]=test');
      expect(response.statusCode).toEqual(400);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Bad Request - Validation failed');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.length).toBeGreaterThan(0);
      expect(responseJson.data[0].fieldName).toBe('pseudo');
      expect(responseJson.data[0].propertyErrors[0]).toBe("pseudo fieldName can't be used as a filter");
    });

    it('GetAll Task with wrong uuid filter', async () => {
      const response = await request(app.getHttpServer()).get('/task?filter[task_id]=11111');
      expect(response.statusCode).toEqual(400);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Bad Request - Validation failed');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.length).toBeGreaterThan(0);
      expect(responseJson.data[0].fieldName).toBe('task_id');
      expect(responseJson.data[0].propertyErrors[0]).toBe('task_id must be a UUID');
    });
  });

  describe('Get one task', () => {
    it('Get Task by id', async () => {
      const taskId = tasklist[0].task_id;
      const response = await request(app.getHttpServer()).get('/task/' + taskId);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.task_id).toBe(taskId);
    });

    it('Get Task with wrong id', async () => {
      const taskId = '39048102-0e9b-46c7-9dd6-de34169e3111';
      const response = await request(app.getHttpServer()).get('/task/' + taskId);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Task not found with id : 39048102-0e9b-46c7-9dd6-de34169e3111');
      expect(responseJson.path).toBe('/task/39048102-0e9b-46c7-9dd6-de34169e3111');
    });

    it('Get Task with wrong uuid format', async () => {
      const taskId = '39048102-0e9b-46c7-9dd6-de34169e3xxx';
      const response = await request(app.getHttpServer()).get('/task/' + taskId);
      expect(response.statusCode).toEqual(400);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Validation failed (uuid is expected)');
      expect(responseJson.error).toBe('Bad Request');
    });
  });

  describe('Create task', () => {
    it('create valid task', async () => {
      const dto: CreateTaskDTO = {
        event_id: eventForTask.event_id,
        user_id: userForTask.user_id,
        title: 'Fake title'
      };
      const response = await request(app.getHttpServer()).post('/task').send(dto);
      expect(response.statusCode).toEqual(201);
      const responseJson = response.body;
      tasklist.push(responseJson.record);

      expect(responseJson.message).toBe('The task has been created successfully');
      expect(responseJson.record).toBeDefined;
      expect(responseJson.record.title).toBe(dto.title);
      expect(responseJson.record.user).toBeDefined();
      expect(responseJson.record.user.firstname).toBe(userForTask.firstname);
      expect(responseJson.record.user.lastname).toBe(userForTask.lastname);
      expect(responseJson.record.event).toBeDefined();
      expect(responseJson.record.event.title).toBe(eventForTask.title);
      expect(responseJson.record.task_id).not.toBeNull();
      expect(responseJson.record.creation_date).not.toBeNull();
    });

    it('create task with not found event', async () => {
      const dto: CreateTaskDTO = {
        event_id: eventForTask.event_id,
        user_id: userForTask.user_id,
        title: 'fake task'
      };

      dto.event_id = '312a9f8f-5317-4dde-ba2d-a91fd98f3e08';
      const response = await request(app.getHttpServer()).post('/task').send(dto);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Event not found with id : ' + dto.event_id);
      expect(responseJson.path).toBe('/task');
    });

    it('create task with not found user', async () => {
      const dto: CreateTaskDTO = {
        event_id: eventForTask.event_id,
        user_id: userForTask.user_id,
        title: 'fake task'
      };

      dto.user_id = '312a9f8f-5317-4dde-ba2d-a91fd98f3e08';
      const response = await request(app.getHttpServer()).post('/task').send(dto);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.message).toBe('User not found with id : ' + dto.user_id);
      expect(responseJson.path).toBe('/task');
    });
  });

  describe('Update task', () => {
    const dto: UpdateTaskDTO = {
      task_id: tasklist[0].task_id,
      achieve: true
    };

    it('Update location for existing task', async () => {
      const task = tasklist[0];
      const response = await request(app.getHttpServer())
        .patch('/task/' + task.task_id)
        .send(dto);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.message).toBe('The task has been updated successfully');
      expect(responseJson.id).toBe(task.task_id);

      const responseGet = await request(app.getHttpServer()).get('/task/' + task.task_id);
      expect(responseGet.statusCode).toEqual(200);
      const responseGetJson = responseGet.body;
      expect(responseGetJson.achieve).toBe(true);
    });

    it('Try to update non-existing task', async () => {
      const fakeId = '39048102-0e9b-46c7-9dd6-de34169e3111';
      const response = await request(app.getHttpServer())
        .patch('/task/' + fakeId)
        .send(dto);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Task not found with id : ' + fakeId);
      expect(responseJson.path).toBe('/task/' + fakeId);
    });
  });

  describe('delete task', () => {
    it('valid deletion of an task', async () => {
      const task = tasklist.pop();
      const response = await request(app.getHttpServer()).delete('/task/' + task.task_id);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.message).toBe('The task has been deleted successfully');
      expect(responseJson.id).toBe(task.task_id);
    });
    it('valid deletion of an task', async () => {
      const fakeId = '39048102-0e9b-46c7-9dd6-de34169e3111';
      const response = await request(app.getHttpServer()).delete('/task/' + fakeId);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Task not found with id : ' + fakeId);
      expect(responseJson.path).toBe('/task/' + fakeId);
    });
  });

  afterAll(async () => {
    if (tasklist.length > 0) {
      for (let task of tasklist) {
        await taskRepository.delete(task.task_id);
      }
    }
    await eventRepository.delete(eventForTask.event_id);
    await userRepository.delete(userForTask.user_id);
    await groupRepository.delete(groupForTask.group_id);
    await app.close();
  });
});
