import { INestApplication, ValidationError, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import * as request from 'supertest';
import { BadRequestExceptionValidation } from '../../common/exception/badRequestExceptionValidation';
import { User } from '../user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LIMIT } from '../../common/object/pagination.object';
import { BadRequestExceptionFilter } from '../../common/exception/badRequestExceptionFilter';
import { QueryFailedErrorException } from '../../common/exception/queryFailledErrorException';
import { CreateUserDTO, UpdateUserDTO } from '../user.dto';

describe('User', () => {
  let app: INestApplication;
  let userlist: Partial<User>[] = [
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
  let userRepository;

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

    userRepository = await moduleRef.get(getRepositoryToken(User));
    for (let user of userlist) {
      await userRepository.save(user);
    }
  });

  describe('GetAll User', () => {
    it('GetAll User with no filter or pagination', async () => {
      const response = await request(app.getHttpServer()).get('/user');
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.count).toBeGreaterThan(0);
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBeGreaterThan(0);
    });

    it('GetAll User with limit set manually', async () => {
      const limit = 5;
      const response = await request(app.getHttpServer()).get('/user?page[limit]=' + limit);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.count).toBeGreaterThan(0);
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBeLessThanOrEqual(limit);
    });

    it('GetAll User with offset set manually', async () => {
      const offset = 4;
      const response = await request(app.getHttpServer()).get('/user?page[offset]=' + offset);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.count).toBeGreaterThan(0);
      expect(responseJson.records).toBeDefined();
    });

    it('GetAll User with limit & offset set manually', async () => {
      const offset = 5;
      const limit = 5;
      const response = await request(app.getHttpServer()).get('/user?page[offset]=' + offset + '&page[limit]=' + limit);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.count).toBeGreaterThan(0);
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBeLessThanOrEqual(limit);
    });

    it('GetAll User with filter and default limit', async () => {
      const response = await request(app.getHttpServer()).get('/user?filter[pseudo]=fakeForTestEndToEnd');
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBeLessThanOrEqual(LIMIT);
      for (let record of responseJson.records) {
        expect(record.mail).toMatch('fake');
      }
    });

    it('GetAll User with filter active=false', async () => {
      const response = await request(app.getHttpServer()).get(
        '/user?filter[pseudo]=fakeForTestEndToEnd&filter[active]=false'
      );
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.records).toBeDefined();
      for (let record of responseJson.records) {
        expect(record.active).toBe(false);
      }
    });

    it('GetAll User with filter active=true', async () => {
      const response = await request(app.getHttpServer()).get(
        '/user?filter[pseudo]=fakeForTestEndToEnd&filter[active]=true'
      );
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.records).toBeDefined();
      for (let record of responseJson.records) {
        expect(record.active).toBe(true);
      }
    });

    it('GetAll User with filter', async () => {
      const response = await request(app.getHttpServer()).get('/user?filter[active]=true&filter[mail]=gmail.com');
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.records).toBeDefined();
      for (let record of responseJson.records) {
        expect(record.active).toBe(true);
        expect(record.mail).toMatch('gmail.com');
      }
    });

    it('GetAll User with wrong boolean filter', async () => {
      const response = await request(app.getHttpServer()).get('/user?filter[active]=test');
      expect(response.statusCode).toEqual(400);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Bad Request - Validation failed');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.length).toBeGreaterThan(0);
      expect(responseJson.data[0].fieldName).toBe('active');
      expect(responseJson.data[0].propertyErrors[0]).toBe('active must be a boolean value');
    });

    it('GetAll User with wrong uuid filter', async () => {
      const response = await request(app.getHttpServer()).get('/user?filter[user_id]=11111');
      expect(response.statusCode).toEqual(400);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Bad Request - Validation failed');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.length).toBeGreaterThan(0);
      expect(responseJson.data[0].fieldName).toBe('user_id');
      expect(responseJson.data[0].propertyErrors[0]).toBe('user_id must be a UUID');
    });
  });

  describe('Get one user', () => {
    it('Get User by id', async () => {
      const userId = userlist[0].user_id;
      const response = await request(app.getHttpServer()).get('/user/' + userId);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.user_id).toBe(userId);
    });

    it('Get User with wrong id', async () => {
      const userId = '39048102-0e9b-46c7-9dd6-de34169e3111';
      const response = await request(app.getHttpServer()).get('/user/' + userId);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.message).toBe('User not found with id : 39048102-0e9b-46c7-9dd6-de34169e3111');
      expect(responseJson.path).toBe('/user/39048102-0e9b-46c7-9dd6-de34169e3111');
    });

    it('Get User with wrong uuid format', async () => {
      const userId = '39048102-0e9b-46c7-9dd6-de34169e3xxx';
      const response = await request(app.getHttpServer()).get('/user/' + userId);
      expect(response.statusCode).toEqual(400);
      const responseJson = response.body;
      expect(responseJson.message).toBe('Validation failed (uuid is expected)');
      expect(responseJson.error).toBe('Bad Request');
    });
  });

  describe('Create user', () => {
    const dto: CreateUserDTO = {
      mail: 'fake5@gmail.com',
      firstname: 'fake',
      lastname: 'fake',
      pseudo: 'fake',
      password: 'fake'
    };

    it('create valid user', async () => {
      const response = await request(app.getHttpServer()).post('/user').send(dto);
      expect(response.statusCode).toEqual(201);
      const responseJson = response.body;
      userlist.push(responseJson.record);

      expect(responseJson.message).toBe('The user has been created successfully');
      expect(responseJson.record).toBeDefined;
      expect(responseJson.record.mail).toBe(dto.mail);
      expect(responseJson.record.firstname).toBe(dto.firstname);
      expect(responseJson.record.lastname).toBe(dto.lastname);
      expect(responseJson.record.password).toBe(dto.password);
      expect(responseJson.record.pseudo).toBe(dto.pseudo);
      expect(responseJson.record.user_id).not.toBeNull();
      expect(responseJson.record.creation_date).not.toBeNull();
      expect(responseJson.record.active).toBe(false);
    });

    it('create user with already used email', async () => {
      const response = await request(app.getHttpServer()).post('/user').send(dto);
      expect(response.statusCode).toEqual(500);
      const responseJson = response.body;
      expect(responseJson.message).toBe('duplicate key value violates unique constraint "user_mail_key"');
      expect(responseJson.path).toBe('/user');
    });
  });

  describe('Update user', () => {
    const dto: Partial<UpdateUserDTO> = {
      lastname: 'fakeUpdate'
    };

    it('Update pseudo for existing user', async () => {
      const user = userlist[0];
      const response = await request(app.getHttpServer())
        .patch('/user/' + user.user_id)
        .send(dto);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.message).toBe('The user has been updated successfully');
      expect(responseJson.id).toBe(user.user_id);

      const responseGet = await request(app.getHttpServer()).get('/user/' + user.user_id);
      expect(responseGet.statusCode).toEqual(200);
      const responseGetJson = responseGet.body;
      expect(responseGetJson.lastname).toBe(dto.lastname);
    });

    it('Try to update non-existing user', async () => {
      const fakeId = '39048102-0e9b-46c7-9dd6-de34169e3111';
      const response = await request(app.getHttpServer())
        .patch('/user/' + fakeId)
        .send(dto);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.message).toBe('User not found with id : ' + fakeId);
      expect(responseJson.path).toBe('/user/' + fakeId);
    });

    it('Try to update user with existing email', async () => {
      const user = userlist[0];
      const dto: Partial<UpdateUserDTO> = {
        mail: userlist[1].mail
      };
      const response = await request(app.getHttpServer())
        .patch('/user/' + user.user_id)
        .send(dto);
      expect(response.statusCode).toEqual(500);
      const responseJson = response.body;
      expect(responseJson.message).toBe('duplicate key value violates unique constraint "user_mail_key"');
      expect(responseJson.path).toBe('/user/' + user.user_id);
    });
  });

  describe('delete user', () => {
    it('valid deletion of an user', async () => {
      const user = userlist.pop();
      const response = await request(app.getHttpServer()).delete('/user/' + user.user_id);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.message).toBe('The user has been deleted successfully');
      expect(responseJson.id).toBe(user.user_id);
    });
    it('valid deletion of an user', async () => {
      const fakeId = '39048102-0e9b-46c7-9dd6-de34169e3111';
      const response = await request(app.getHttpServer()).delete('/user/' + fakeId);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.message).toBe('User not found with id : ' + fakeId);
      expect(responseJson.path).toBe('/user/' + fakeId);
    });
  });

  afterAll(async () => {
    for (let user of userlist) {
      await userRepository.delete(user.user_id);
    }
    await app.close();
  });
});
