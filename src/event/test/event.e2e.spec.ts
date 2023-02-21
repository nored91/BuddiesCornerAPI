import { INestApplication, ValidationError, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import * as request from 'supertest';
import { BadRequestExceptionValidation } from '../../common/exception/badRequestExceptionValidation';
import { Event, EventType } from '../event.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LIMIT } from '../../common/object/pagination.object';
import { BadRequestExceptionFilter } from '../../common/exception/badRequestExceptionFilter';
import { QueryFailedErrorException } from '../../common/exception/queryFailledErrorException';
import { CreateEventDTO, UpdateEventDTO } from '../event.dto';
import { Group } from '../../group/group.entity';
import { Repository } from 'typeorm/repository/Repository';
import { User } from '../../user/user.entity';

describe('Event', () => {
  let app: INestApplication;
  let groupRepository: Repository<Group>;
  let eventRepository: Repository<Event>;
  let userRepository: Repository<User>;
  let groupForEvent: Group = null;
  let userForEvent: User = null;

  let groupPartialForEvent: Partial<Group> = {
    title: 'fake group for fake event',
    description: 'fake description for test event'
  };

  let userPartialForEvent: Partial<User> = {
    mail: 'fakeEventUser@gmail.com',
    firstname: 'fakeUserForEvent',
    lastname: 'fake',
    pseudo: 'fakeForTestEndToEnd',
    password: 'fake',
    active: true
  };

  let eventlist: Partial<Event>[] = [
    {
      title: 'Initiation escalade',
      description: 'fake event',
      location: 'Paris',
      type: EventType.sport,
      event_date: new Date('2023-05-16')
    },
    {
      title: 'Vacances en croatie',
      description: 'fake event',
      location: 'grenoble',
      type: EventType.other,
      event_date: new Date('2024-03-16')
    },
    {
      title: 'Soirée après la grimpe',
      description: 'fake event',
      location: 'Le labo !!!',
      type: EventType.party,
      event_date: new Date('2023-03-16')
    }
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

    groupRepository = await moduleRef.get(getRepositoryToken(Group));
    userRepository = await moduleRef.get(getRepositoryToken(User));
    eventRepository = await moduleRef.get(getRepositoryToken(Event));

    userForEvent = await userRepository.save(userPartialForEvent);
    groupForEvent = await groupRepository.save(groupPartialForEvent);

    for (let event of eventlist) {
      event.group = groupForEvent;
      event.creator_user = userForEvent;
      await eventRepository.save(event);
    }
  });

  describe('GetAll Event', () => {
    it('GetAll Event with no filter or pagination', async () => {
      const response = await request(app.getHttpServer()).get('/event');
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.count).toBeGreaterThan(0);
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBeGreaterThan(0);
    });

    it('GetAll Event with limit set manually', async () => {
      const limit = 5;
      const response = await request(app.getHttpServer()).get('/event?page[limit]=' + limit);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.count).toBeGreaterThan(0);
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBeLessThanOrEqual(limit);
    });

    it('GetAll Event with offset set manually', async () => {
      const offset = 2;
      const response = await request(app.getHttpServer()).get('/event?page[offset]=' + offset);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.count).toBeGreaterThan(0);
      expect(responseJson.records).toBeDefined();
    });

    it('GetAll Event with limit & offset set manually', async () => {
      const offset = 2;
      const limit = 4;
      const response = await request(app.getHttpServer()).get('/event?page[offset]=' + offset + '&page[limit]=' + limit);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.count).toBeGreaterThan(0);
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBeLessThanOrEqual(limit);
    });

    it('GetAll Event with filter and default limit', async () => {
      const response = await request(app.getHttpServer()).get('/event?filter[description]=fake event');
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBeLessThanOrEqual(LIMIT);
      for (let record of responseJson.records) {
        expect(record.description).toMatch('fake event');
      }
    });

    it('GetAll Event with filter on creator_user firstname', async () => {
      const response = await request(app.getHttpServer()).get(
        '/event?filter[description]=fake event&filter[creator_user][firstname]=fakeUserForEvent'
      );
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBe(3);
      for (let record of responseJson.records) {
        expect(record.creator_user.firstname).toBe('fakeUserForEvent');
        expect(record.creator_user.user_id).toMatch(userForEvent.user_id);
      }
    });

    it('GetAll Event with filter on group title', async () => {
      const response = await request(app.getHttpServer()).get('/event?filter[group][title]=fake group for fake event');
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBe(3);
      for (let record of responseJson.records) {
        expect(record.group.title).toBe('fake group for fake event');
        expect(record.group.group_id).toMatch(groupForEvent.group_id);
      }
    });

    it('GetAll Event with filter on event type', async () => {
      const response = await request(app.getHttpServer()).get(
        '/event?filter[creator_user][firstname]=fakeUserForEvent&filter[type]=' + EventType.party
      );
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.records).toBeDefined();
      for (let record of responseJson.records) {
        expect(record.type).toBe(EventType.party);
        expect(record.creator_user.user_id).toMatch(userForEvent.user_id);
      }
    });

    it('GetAll Event with wrong type', async () => {
      const response = await request(app.getHttpServer()).get('/event?filter[creator_user][firstname]=fakeUserForEvent&filter[type]=t');
      expect(response.statusCode).toEqual(400);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Bad Request - Validation failed');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.length).toBeGreaterThan(0);
      expect(responseJson.data[0].fieldName).toBe('type');
      expect(responseJson.data[0].propertyErrors[0]).toBe('type must be a valid enum value');
    });

    it('GetAll Event with bad request exception because user_id is incorrect', async () => {
      const response = await request(app.getHttpServer()).get('/event?filter[creator_user][user_id]=1234567');
      expect(response.statusCode).toEqual(400);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Bad Request - Validation failed');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.length).toBeGreaterThan(0);
      expect(responseJson.data[0].fieldName).toBe('user_id');
      expect(responseJson.data[0].propertyErrors[0]).toBe('user_id must be a UUID');
    });

    it('GetAll Event with bad request exception because user pseudo is not part of authorized filter', async () => {
      const response = await request(app.getHttpServer()).get('/event?filter[creator_user][pseudo]=test');
      expect(response.statusCode).toEqual(400);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Bad Request - Validation failed');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.length).toBeGreaterThan(0);
      expect(responseJson.data[0].fieldName).toBe('pseudo');
      expect(responseJson.data[0].propertyErrors[0]).toBe("pseudo fieldName can't be used as a filter");
    });

    it('GetAll Event with wrong uuid filter', async () => {
      const response = await request(app.getHttpServer()).get('/event?filter[event_id]=11111');
      expect(response.statusCode).toEqual(400);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Bad Request - Validation failed');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.length).toBeGreaterThan(0);
      expect(responseJson.data[0].fieldName).toBe('event_id');
      expect(responseJson.data[0].propertyErrors[0]).toBe('event_id must be a UUID');
    });
  });

  describe('Get one event', () => {
    it('Get Event by id', async () => {
      const eventId = eventlist[0].event_id;
      const response = await request(app.getHttpServer()).get('/event/' + eventId);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.event_id).toBe(eventId);
    });

    it('Get Event with wrong id', async () => {
      const eventId = '39048102-0e9b-46c7-9dd6-de34169e3111';
      const response = await request(app.getHttpServer()).get('/event/' + eventId);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Event not found with id : 39048102-0e9b-46c7-9dd6-de34169e3111');
      expect(responseJson.path).toBe('/event/39048102-0e9b-46c7-9dd6-de34169e3111');
    });

    it('Get Event with wrong uuid format', async () => {
      const eventId = '39048102-0e9b-46c7-9dd6-de34169e3xxx';
      const response = await request(app.getHttpServer()).get('/event/' + eventId);
      expect(response.statusCode).toEqual(400);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Validation failed (uuid is expected)');
      expect(responseJson.error).toBe('Bad Request');
    });
  });

  describe('Create event', () => {
    it('create valid event', async () => {
      const dto: CreateEventDTO = {
        group_id: groupForEvent.group_id,
        creator_user_id: userForEvent.user_id,
        title: 'fake event party',
        description: 'fake event',
        location: 'grenoble',
        type: EventType.party,
        event_date: '2023-03-16'
      };
      const response = await request(app.getHttpServer()).post('/event').send(dto);
      expect(response.statusCode).toEqual(201);
      const responseJson = response.body;
      eventlist.push(responseJson.record);

      expect(responseJson.message).toBe('The event has been created successfully');
      expect(responseJson.record).toBeDefined;
      expect(responseJson.record.title).toBe(dto.title);
      expect(responseJson.record.creator_user).toBeDefined();
      expect(responseJson.record.creator_user.firstname).toBe(userForEvent.firstname);
      expect(responseJson.record.creator_user.lastname).toBe(userForEvent.lastname);
      expect(responseJson.record.group).toBeDefined();
      expect(responseJson.record.group.title).toBe(groupForEvent.title);
      expect(responseJson.record.event_id).not.toBeNull();
      expect(responseJson.record.creation_date).not.toBeNull();
      expect(responseJson.record.type).toBe(EventType.party);
    });

    it('create event with not found group', async () => {
      const dto: CreateEventDTO = {
        group_id: groupForEvent.group_id,
        creator_user_id: userForEvent.user_id,
        title: 'fake event party',
        description: 'fake event',
        location: 'grenoble',
        type: EventType.party,
        event_date: '2023-03-16'
      };

      dto.group_id = '312a9f8f-5317-4dde-ba2d-a91fd98f3e08';
      const response = await request(app.getHttpServer()).post('/event').send(dto);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Group not found with id : ' + dto.group_id);
      expect(responseJson.path).toBe('/event');
    });

    it('create event with not found user', async () => {
      const dto: CreateEventDTO = {
        group_id: groupForEvent.group_id,
        creator_user_id: userForEvent.user_id,
        title: 'fake event party',
        description: 'fake event',
        location: 'grenoble',
        type: EventType.party,
        event_date: '2023-03-16'
      };

      dto.creator_user_id = '312a9f8f-5317-4dde-ba2d-a91fd98f3e08';
      const response = await request(app.getHttpServer()).post('/event').send(dto);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.message).toBe('User not found with id : ' + dto.creator_user_id);
      expect(responseJson.path).toBe('/event');
    });
  });

  describe('Update event', () => {
    const dto: Partial<UpdateEventDTO> = {
      location: 'Labo - Grenoble'
    };

    it('Update location for existing event', async () => {
      const event = eventlist[0];
      const response = await request(app.getHttpServer())
        .patch('/event/' + event.event_id)
        .send(dto);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.message).toBe('The event has been updated successfully');
      expect(responseJson.id).toBe(event.event_id);

      const responseGet = await request(app.getHttpServer()).get('/event/' + event.event_id);
      expect(responseGet.statusCode).toEqual(200);
      const responseGetJson = responseGet.body;
      expect(responseGetJson.location).toBe(dto.location);
    });

    it('Try to update non-existing event', async () => {
      const fakeId = '39048102-0e9b-46c7-9dd6-de34169e3111';
      const response = await request(app.getHttpServer())
        .patch('/event/' + fakeId)
        .send(dto);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Event not found with id : ' + fakeId);
      expect(responseJson.path).toBe('/event/' + fakeId);
    });
  });

  describe('delete event', () => {
    it('valid deletion of an event', async () => {
      const event = eventlist.pop();
      const response = await request(app.getHttpServer()).delete('/event/' + event.event_id);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.message).toBe('The event has been deleted successfully');
      expect(responseJson.id).toBe(event.event_id);
    });
    it('valid deletion of an event', async () => {
      const fakeId = '39048102-0e9b-46c7-9dd6-de34169e3111';
      const response = await request(app.getHttpServer()).delete('/event/' + fakeId);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Event not found with id : ' + fakeId);
      expect(responseJson.path).toBe('/event/' + fakeId);
    });
  });

  afterAll(async () => {
    for (let event of eventlist) {
      await eventRepository.delete(event.event_id);
    }

    await userRepository.delete(userForEvent.user_id);
    await groupRepository.delete(groupForEvent.group_id);
    await app.close();
  });
});
