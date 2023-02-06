import { INestApplication, ValidationError, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "../app.module";
import * as request from 'supertest';
import { BadRequestExceptionValidation } from "../common/exception/badRequestExceptionValidation";
import { User } from "./user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";

describe('User',() => {
  let app: INestApplication;
  let userlist : Partial<User>[] = [{
      mail: 'fake@gmail.com',
      firstname: 'fake',
      lastname: 'fake',
      pseudo: 'fake',
      password: 'fake',
      active : true
    },
    {
      mail: 'fake1@gmail.com',
      firstname: 'fake',
      lastname: 'fake',
      pseudo: 'fake',
      password: 'fake'
    },
    {
      mail: 'fake2@gmail.com',
      firstname: 'fake',
      lastname: 'fake',
      pseudo: 'fake',
      password: 'fake'
    },
    {
      mail: 'fake3@gmail.com',
      firstname: 'fake',
      lastname: 'fake',
      pseudo: 'fake',
      password: 'fake'
    },
    {
      mail: 'fake4@gmail.com',
      firstname: 'fake',
      lastname: 'fake',
      pseudo: 'fake',
      password: 'fake'
    }
  ];
  let userRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      enableDebugMessages: true,
      transform: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new BadRequestExceptionValidation(validationErrors);
      }
    }));
    await app.init();
    userRepository = await moduleRef.get(getRepositoryToken(User));
    for(let user of userlist){
      await userRepository.save(user);
    };

  });

  it('GetAll User', async () => {
    const response = await request(app.getHttpServer()).get('/user');
    expect(response.statusCode).toEqual(200);
    const responseJson = JSON.parse(response.text);
    expect(responseJson.count).toBeDefined();
    expect(responseJson.count).toBeGreaterThan(0);
    expect(responseJson.records).toBeDefined();
    expect(responseJson.records.length).toBeGreaterThan(0);
  });

  it('GetAll User with limit', async () => {
    const limit = 5;
    const response = await request(app.getHttpServer()).get('/user?page[limit]=' + limit);
    expect(response.statusCode).toEqual(200);
    const responseJson = JSON.parse(response.text);
    expect(responseJson.count).toBeDefined();
    expect(responseJson.count).toBeGreaterThan(0);
    expect(responseJson.records).toBeDefined();
    expect(responseJson.records.length).toBeLessThanOrEqual(limit);
  });

  it('GetAll User with offset', async () => {
    const offset = 5;
    const response = await request(app.getHttpServer()).get('/user?page[offset]=' + offset);
    expect(response.statusCode).toEqual(200);
    const responseJson = JSON.parse(response.text);
    expect(responseJson.count).toBeDefined();
    expect(responseJson.count).toBeGreaterThan(0);
    expect(responseJson.records).toBeDefined();
  });

  it('GetAll User with limit & offset', async () => {
    const offset = 5;
    const limit = 5;
    const response = await request(app.getHttpServer()).get('/user?page[offset]=' + offset + '&page[limit]=' + limit);
    expect(response.statusCode).toEqual(200);
    const responseJson = JSON.parse(response.text);
    expect(responseJson.count).toBeDefined();
    expect(responseJson.count).toBeGreaterThan(0);
    expect(responseJson.records).toBeDefined();
    expect(responseJson.records.length).toBeLessThanOrEqual(limit);
  });

  it('GetAll User with filter', async () => {
    const response = await request(app.getHttpServer()).get('/user?filter[mail]=fake');
    expect(response.statusCode).toEqual(200);
    const responseJson = JSON.parse(response.text);
    expect(responseJson.count).toBeDefined();
    expect(responseJson.count).toEqual(5);
    expect(responseJson.records).toBeDefined();
    expect(responseJson.records.length).toEqual(5);
    for(let record of responseJson.records){
      expect(record.mail).toMatch('fake');
    }
  });

  it('GetAll User with filter', async () => {
    const response = await request(app.getHttpServer()).get('/user?filter[active]=false');
    expect(response.statusCode).toEqual(200);
    const responseJson = JSON.parse(response.text);
    expect(responseJson.count).toBeDefined();
    expect(responseJson.count).toEqual(5);
    expect(responseJson.records).toBeDefined();
    expect(responseJson.records.length).toEqual(5);
    for(let record of responseJson.records){
      expect(record.active).toBe(false);
    }
  });

  afterAll(async () => {
    for(let user of userlist){
      await userRepository.delete(user);
    };
    await app.close();  
  });
});