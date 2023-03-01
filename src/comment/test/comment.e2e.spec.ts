import { INestApplication, ValidationError, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import * as request from 'supertest';
import { BadRequestExceptionValidation } from '../../common/exception/badRequestExceptionValidation';
import { Comment } from '../comment.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LIMIT } from '../../common/object/pagination.object';
import { BadRequestExceptionFilter } from '../../common/exception/badRequestExceptionFilter';
import { QueryFailedErrorException } from '../../common/exception/queryFailledErrorException';
import { CreateCommentDTO, UpdateCommentDTO } from '../comment.dto';
import { Event, EventType } from '../../event/event.entity';
import { Repository } from 'typeorm/repository/Repository';
import { User } from '../../user/user.entity';
import { Group } from '../../group/group.entity';

describe('Comment', () => {
  let app: INestApplication;
  let eventRepository: Repository<Event>;
  let commentRepository: Repository<Comment>;
  let userRepository: Repository<User>;
  let groupRepository: Repository<Group>;
  let eventForComment: Event = null;
  let userForComment: User = null;
  let groupForComment: Group = null;

  let groupPartialForComment: Partial<Group> = {
    title: 'fake group for fake event'
  };

  let eventPartialForComment: Partial<Event> = {
    title: 'fake event for fake comment',
    description: 'fake description for test comment',
    type: EventType.sport
  };

  let userPartialForComment: Partial<User> = {
    mail: 'fakeCommentUser@gmail.com',
    firstname: 'fakeUserForComment',
    lastname: 'fake',
    pseudo: 'fakeForTestEndToEnd',
    password: 'fake',
    active: true
  };

  let commentlist: Partial<Comment>[] = [{ message: 'Fake comment 1' }, { message: 'Fake comment 2' }, { message: 'Fake comment 3' }];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
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
    commentRepository = await moduleRef.get(getRepositoryToken(Comment));
    groupRepository = await moduleRef.get(getRepositoryToken(Group));

    userForComment = await userRepository.save(userPartialForComment);
    groupForComment = await groupRepository.save(groupPartialForComment);
    eventPartialForComment.group = groupForComment;
    eventPartialForComment.creator_user = userForComment;
    eventForComment = await eventRepository.save(eventPartialForComment);

    for (let comment of commentlist) {
      comment.event = eventForComment;
      comment.user = userForComment;
      await commentRepository.save(comment);
    }
  });

  describe('GetAll Comment', () => {
    it('GetAll Comment with no filter or pagination', async () => {
      const response = await request(app.getHttpServer()).get('/comment');
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.count).toBeGreaterThan(0);
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBeGreaterThan(0);
    });

    it('GetAll Comment with limit set manually', async () => {
      const limit = 5;
      const response = await request(app.getHttpServer()).get('/comment?page[limit]=' + limit);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.count).toBeGreaterThan(0);
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBeLessThanOrEqual(limit);
    });

    it('GetAll Comment with offset set manually', async () => {
      const offset = 2;
      const response = await request(app.getHttpServer()).get('/comment?page[offset]=' + offset);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.count).toBeGreaterThan(0);
      expect(responseJson.records).toBeDefined();
    });

    it('GetAll Comment with limit & offset set manually', async () => {
      const offset = 2;
      const limit = 4;
      const response = await request(app.getHttpServer()).get('/comment?page[offset]=' + offset + '&page[limit]=' + limit);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.count).toBeGreaterThan(0);
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBeLessThanOrEqual(limit);
    });

    it('GetAll Comment with filter and default limit', async () => {
      const response = await request(app.getHttpServer()).get('/comment?filter[title]=Fake comment - apporter à manger');
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBeLessThanOrEqual(LIMIT);
      for (let record of responseJson.records) {
        expect(record.title).toBe('Fake comment - apporter à manger');
      }
    });

    it('GetAll Comment with filter on user firstname', async () => {
      const response = await request(app.getHttpServer()).get(
        '/comment?filter[title]=fake comment&filter[user][firstname]=fakeUserForComment'
      );
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBe(3);
      for (let record of responseJson.records) {
        expect(record.user.firstname).toBe('fakeUserForComment');
        expect(record.user.user_id).toMatch(userForComment.user_id);
      }
    });

    it('GetAll Comment with filter on event title', async () => {
      const response = await request(app.getHttpServer()).get('/comment?filter[event][title]=fake event for fake comment');
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.records).toBeDefined();
      expect(responseJson.records.length).toBe(3);
      for (let record of responseJson.records) {
        expect(record.event.title).toBe('fake event for fake comment');
        expect(record.event.event_id).toMatch(eventForComment.event_id);
      }
    });

    it('GetAll Comment with filter on achieve', async () => {
      const response = await request(app.getHttpServer()).get('/comment?filter[user][firstname]=fakeUserForComment&filter[achieve]=false');
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.count).toBeDefined();
      expect(responseJson.records).toBeDefined();
      for (let record of responseJson.records) {
        expect(record.achieve).toBe(false);
        expect(record.user.user_id).toMatch(userForComment.user_id);
      }
    });

    it('GetAll Comment with wrong boolean value', async () => {
      const response = await request(app.getHttpServer()).get('/comment?filter[user][firstname]=fakeUserForComment&filter[achieve]=TRUE');
      expect(response.statusCode).toEqual(400);
      const responseJson = response.body;
      expect(responseJson.comment).toBe('Bad Request - Validation failed');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.length).toBeGreaterThan(0);
      expect(responseJson.data[0].fieldName).toBe('achieve');
      expect(responseJson.data[0].propertyErrors[0]).toBe('achieve must be a boolean value');
    });

    it('GetAll Comment with bad request exception because user_id is incorrect', async () => {
      const response = await request(app.getHttpServer()).get('/comment?filter[user][user_id]=1234567');
      expect(response.statusCode).toEqual(400);
      const responseJson = response.body;
      expect(responseJson.comment).toBe('Bad Request - Validation failed');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.length).toBeGreaterThan(0);
      expect(responseJson.data[0].fieldName).toBe('user_id');
      expect(responseJson.data[0].propertyErrors[0]).toBe('user_id must be a UUID');
    });

    it('GetAll Comment with bad request exception because user pseudo is not part of authorized filter', async () => {
      const response = await request(app.getHttpServer()).get('/comment?filter[user][pseudo]=test');
      expect(response.statusCode).toEqual(400);
      const responseJson = response.body;
      expect(responseJson.comment).toBe('Bad Request - Validation failed');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.length).toBeGreaterThan(0);
      expect(responseJson.data[0].fieldName).toBe('pseudo');
      expect(responseJson.data[0].propertyErrors[0]).toBe("pseudo fieldName can't be used as a filter");
    });

    it('GetAll Comment with wrong uuid filter', async () => {
      const response = await request(app.getHttpServer()).get('/comment?filter[comment_id]=11111');
      expect(response.statusCode).toEqual(400);
      const responseJson = response.body;
      expect(responseJson.comment).toBe('Bad Request - Validation failed');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.length).toBeGreaterThan(0);
      expect(responseJson.data[0].fieldName).toBe('comment_id');
      expect(responseJson.data[0].propertyErrors[0]).toBe('comment_id must be a UUID');
    });
  });

  describe('Get one comment', () => {
    it('Get Comment by id', async () => {
      const commentId = commentlist[0].comment_id;
      const response = await request(app.getHttpServer()).get('/comment/' + commentId);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.comment_id).toBe(commentId);
    });

    it('Get Comment with wrong id', async () => {
      const commentId = '39048102-0e9b-46c7-9dd6-de34169e3111';
      const response = await request(app.getHttpServer()).get('/comment/' + commentId);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.comment).toBe('Comment not found with id : 39048102-0e9b-46c7-9dd6-de34169e3111');
      expect(responseJson.path).toBe('/comment/39048102-0e9b-46c7-9dd6-de34169e3111');
    });

    it('Get Comment with wrong uuid format', async () => {
      const commentId = '39048102-0e9b-46c7-9dd6-de34169e3xxx';
      const response = await request(app.getHttpServer()).get('/comment/' + commentId);
      expect(response.statusCode).toEqual(400);
      const responseJson = response.body;
      expect(responseJson.comment).toBe('Validation failed (uuid is expected)');
      expect(responseJson.error).toBe('Bad Request');
    });
  });

  describe('Create comment', () => {
    it('create valid comment', async () => {
      const dto: CreateCommentDTO = {
        event_id: eventForComment.event_id,
        user_id: userForComment.user_id,
        message: 'Fake message'
      };
      const response = await request(app.getHttpServer()).post('/comment').send(dto);
      expect(response.statusCode).toEqual(201);
      const responseJson = response.body;
      commentlist.push(responseJson.record);

      expect(responseJson.comment).toBe('The comment has been created successfully');
      expect(responseJson.record).toBeDefined;
      expect(responseJson.record.message).toBe(dto.message);
      expect(responseJson.record.user).toBeDefined();
      expect(responseJson.record.user.firstname).toBe(userForComment.firstname);
      expect(responseJson.record.user.lastname).toBe(userForComment.lastname);
      expect(responseJson.record.event).toBeDefined();
      expect(responseJson.record.event.title).toBe(eventForComment.title);
      expect(responseJson.record.comment_id).not.toBeNull();
      expect(responseJson.record.creation_date).not.toBeNull();
    });

    it('create comment with not found event', async () => {
      const dto: CreateCommentDTO = {
        event_id: eventForComment.event_id,
        user_id: userForComment.user_id,
        message: 'fake comment'
      };

      dto.event_id = '312a9f8f-5317-4dde-ba2d-a91fd98f3e08';
      const response = await request(app.getHttpServer()).post('/comment').send(dto);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.comment).toBe('Event not found with id : ' + dto.event_id);
      expect(responseJson.path).toBe('/comment');
    });

    it('create comment with not found user', async () => {
      const dto: CreateCommentDTO = {
        event_id: eventForComment.event_id,
        user_id: userForComment.user_id,
        message: 'fake comment'
      };

      dto.user_id = '312a9f8f-5317-4dde-ba2d-a91fd98f3e08';
      const response = await request(app.getHttpServer()).post('/comment').send(dto);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.comment).toBe('User not found with id : ' + dto.user_id);
      expect(responseJson.path).toBe('/comment');
    });
  });

  describe('Update comment', () => {
    const dto: UpdateCommentDTO = {
      comment_id: commentlist[0].comment_id,
      message: 'Fake edited message'
    };

    it('Update location for existing comment', async () => {
      const comment = commentlist[0];
      const response = await request(app.getHttpServer())
        .patch('/comment/' + comment.comment_id)
        .send(dto);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.comment).toBe('The comment has been updated successfully');
      expect(responseJson.id).toBe(comment.comment_id);

      const responseGet = await request(app.getHttpServer()).get('/comment/' + comment.comment_id);
      expect(responseGet.statusCode).toEqual(200);
      const responseGetJson = responseGet.body;
      expect(responseGetJson.achieve).toBe(true);
    });

    it('Try to update non-existing comment', async () => {
      const fakeId = '39048102-0e9b-46c7-9dd6-de34169e3111';
      const response = await request(app.getHttpServer())
        .patch('/comment/' + fakeId)
        .send(dto);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.comment).toBe('Comment not found with id : ' + fakeId);
      expect(responseJson.path).toBe('/comment/' + fakeId);
    });
  });

  describe('delete comment', () => {
    it('valid deletion of an comment', async () => {
      const comment = commentlist.pop();
      const response = await request(app.getHttpServer()).delete('/comment/' + comment.comment_id);
      expect(response.statusCode).toEqual(200);
      const responseJson = response.body;
      expect(responseJson.comment).toBe('The comment has been deleted successfully');
      expect(responseJson.id).toBe(comment.comment_id);
    });
    it('valid deletion of an comment', async () => {
      const fakeId = '39048102-0e9b-46c7-9dd6-de34169e3111';
      const response = await request(app.getHttpServer()).delete('/comment/' + fakeId);
      expect(response.statusCode).toEqual(404);
      const responseJson = response.body;
      expect(responseJson.comment).toBe('Comment not found with id : ' + fakeId);
      expect(responseJson.path).toBe('/comment/' + fakeId);
    });
  });

  afterAll(async () => {
    if (commentlist.length > 0) {
      for (let comment of commentlist) {
        await commentRepository.delete(comment.comment_id);
      }
    }
    await eventRepository.delete(eventForComment.event_id);
    await userRepository.delete(userForComment.user_id);
    await groupRepository.delete(groupForComment.group_id);
    await app.close();
  });
});
