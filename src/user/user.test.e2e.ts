import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";

describe('User Controller', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET User Get All`, () => {
    return request(app.getHttpServer()).get('/cats')
      .expect(200)
  });

  afterAll(async () => {
    await app.close();
  });
});