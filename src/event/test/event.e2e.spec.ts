import { INestApplication, ValidationError, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import * as request from 'supertest';
import { BadRequestExceptionValidation } from '../../common/exception/badRequestExceptionValidation';
import { Event } from '../event.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LIMIT } from '../../common/object/pagination.object';
import { BadRequestExceptionFilter } from '../../common/exception/badRequestExceptionFilter';
import { QueryFailedErrorException } from '../../common/exception/queryFailledErrorException';
import { CreateEventDTO, UpdateEventDTO } from '../event.dto';

describe('Event', () => {
  /*let app: INestApplication;
  let eventlist: Partial<Event>[] = [
    {
      mail: 'fake@gmail.com',
      firstname: 'fake',
      lastname: 'fake',
      pseudo: 'fakeForTestEndToEnd',
      password: 'fake',
      active: true
    },
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
    },
    {
      mail: 'fake4@gmail.com',
      firstname: 'fake',
      lastname: 'fake',
      pseudo: 'fakeForTestEndToEnd',
      password: 'fake'
    }
  ];
  let eventRepository;

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
    for (let event of eventlist) {
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
      const offset = 4;
      const response = await request(app.getHttpServer()).get('/event?page[offset]=' + offset);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.count).toBeGreaterThan(0);
      expect(responseJson.records).toBeDefined();
    });

    it('GetAll Event with limit & offset set manually', async () => {
      const offset = 5;
      const limit = 5;
      const response = await request(app.getHttpServer()).get('/event?page[offset]=' + offset + '&page[limit]=' + limit);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.count).toBeGreaterThan(0);
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBeLessThanOrEqual(limit);
    });

    it('GetAll Event with filter and default limit', async () => {
      const response = await request(app.getHttpServer()).get('/event?filter[pseudo]=fakeForTestEndToEnd');
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBeLessThanOrEqual(LIMIT);
      for (let record of responseJson.records) {
        expect(record.mail).toMatch('fake');
      }
    });

    it('GetAll Event with filter active=false', async () => {
      const response = await request(app.getHttpServer()).get('/event?filter[pseudo]=fakeForTestEndToEnd&filter[active]=false');
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.records).toBeDefined();
      for (let record of responseJson.records) {
        expect(record.active).toBe(false);
      }
    });

    it('GetAll Event with filter active=true', async () => {
      const response = await request(app.getHttpServer()).get('/event?filter[pseudo]=fakeForTestEndToEnd&filter[active]=true');
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.records).toBeDefined();
      for (let record of responseJson.records) {
        expect(record.active).toBe(true);
      }
    });

    it('GetAll Event with filter', async () => {
      const response = await request(app.getHttpServer()).get('/event?filter[active]=true&filter[mail]=gmail.com');
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.records).toBeDefined();
      for (let record of responseJson.records) {
        expect(record.active).toBe(true);
        expect(record.mail).toMatch('gmail.com');
      }
    });

    it('GetAll Event with wrong boolean filter', async () => {
      const response = await request(app.getHttpServer()).get('/event?filter[active]=test');
      expect(response.statusCode).toEqual(400);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Bad Request - Validation failed');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.length).toBeGreaterThan(0);
      expect(responseJson.data[0].fieldName).toBe('active');
      expect(responseJson.data[0].propertyErrors[0]).toBe('active must be a boolean value');
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
    const dto: CreateEventDTO = {
      mail: 'fake5@gmail.com',
      firstname: 'fake',
      lastname: 'fake',
      pseudo: 'fake',
      password: 'fake'
    };

    it('create valid event', async () => {
      const response = await request(app.getHttpServer()).post('/event').send(dto);
      expect(response.statusCode).toEqual(201);
      const responseJson = response.body;
      eventlist.push(responseJson.record);

      expect(responseJson.message).toBe('The event has been created successfully');
      expect(responseJson.record).toBeDefined;
      expect(responseJson.record.mail).toBe(dto.mail);
      expect(responseJson.record.firstname).toBe(dto.firstname);
      expect(responseJson.record.lastname).toBe(dto.lastname);
      expect(responseJson.record.password).toBe(dto.password);
      expect(responseJson.record.pseudo).toBe(dto.pseudo);
      expect(responseJson.record.event_id).not.toBeNull();
      expect(responseJson.record.creation_date).not.toBeNull();
      expect(responseJson.record.active).toBe(false);
    });

    it('create event with already used email', async () => {
      const response = await request(app.getHttpServer()).post('/event').send(dto);
      expect(response.statusCode).toEqual(500);
      const responseJson = response.body;
      expect(responseJson.message).toBe('duplicate key value violates unique constraint "event_mail_key"');
      expect(responseJson.path).toBe('/event');
    });
  });

  describe('Update event', () => {
    const dto: Partial<UpdateEventDTO> = {
      lastname: 'fakeUpdate'
    };

    it('Update pseudo for existing event', async () => {
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
      expect(responseGetJson.lastname).toBe(dto.lastname);
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

    it('Try to update event with existing email', async () => {
      const event = eventlist[0];
      const dto: Partial<UpdateEventDTO> = {
        mail: eventlist[1].mail
      };
      const response = await request(app.getHttpServer())
        .patch('/event/' + event.event_id)
        .send(dto);
      expect(response.statusCode).toEqual(500);
      const responseJson = response.body;
      expect(responseJson.message).toBe('duplicate key value violates unique constraint "event_mail_key"');
      expect(responseJson.path).toBe('/event/' + event.event_id);
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
    await app.close();
  });
  */
});
