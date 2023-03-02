import { CommentController } from '../comment.controller';
import { CommentService } from '../comment.service';
import { Test } from '@nestjs/testing';
import { Pagination } from '../../common/object/pagination.object';
import { Comment } from '../comment.entity';
import { CommentFilter } from '../comment.filter';
import { ObjectResponseCreate } from '../../common/response/objectResponseCreate';
import { CreateCommentDTO, UpdateCommentDTO } from '../comment.dto';
import { ObjectResponseUpdate } from '../../common/response/objectResponseUpdate';
import { ObjectNotFoundException } from '../../common/exception/objectNotFoundException';
import { ObjectResponseRecord } from '../../common/response/objectResponseRecord';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Event, EventType } from '../../event/event.entity';
import { User } from '../../user/user.entity';
import { UserService } from '../../user/user.service';
import { EventService } from '../../event/event.service';

export const mockRepository = jest.fn(() => ({
  metadata: {
    columns: [],
    relations: []
  }
}));

describe('CommentController', () => {
  let commentController: CommentController;
  let commentService: CommentService;
  let eventService: EventService;
  let userService: UserService;

  const comment: Comment = {
    comment_id: '1',
    event: null,
    user: null,
    message: 'Fake comment',
    creation_date: new Date('2023-01-16 15:11:06.000'),
    edition_date: new Date('2023-03-16 15:11:06.000')
  };

  const event: Event = {
    event_id: '1',
    group: null,
    creator_user: null,
    title: 'fake event',
    description: 'fake event',
    location: 'grenoble',
    type: EventType.sport,
    creation_date: new Date('2023-01-16 15:11:06.000'),
    event_date: new Date('2023-03-16 15:11:06.000')
  };

  const user: User = {
    user_id: '1',
    mail: 'fake@gmail.com',
    firstname: 'fake',
    lastname: 'fake',
    pseudo: 'fake',
    password: '',
    active: true,
    creation_date: new Date('2023-01-16 15:11:06.000')
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CommentService,
        UserService,
        EventService,
        { useClass: mockRepository, provide: getRepositoryToken(Comment) },
        { useClass: mockRepository, provide: getRepositoryToken(User) },
        { useClass: mockRepository, provide: getRepositoryToken(Event) }
      ],
      controllers: [CommentController]
    }).compile();

    commentService = await moduleRef.resolve(CommentService);
    eventService = await moduleRef.resolve(EventService);
    userService = await moduleRef.resolve(UserService);
    commentController = await moduleRef.resolve(CommentController);
  });

  describe('findAll', () => {
    it('findAll should return an array of Comment', async () => {
      const pagination: Pagination = { limit: 1, offset: 0 };
      const queryFilter: CommentFilter = new CommentFilter();
      const serviceResult: [Comment[], number] = [[], 0];
      const controllerResult: ObjectResponseRecord<Comment> = new ObjectResponseRecord<Comment>(serviceResult);
      jest.spyOn(commentService, 'findAll').mockImplementation(async () => serviceResult);
      const result = await commentController.findAll(pagination, queryFilter);

      expect(result).toEqual(controllerResult);
      expect(controllerResult.getRecords()).toBe(serviceResult[0]);
      expect(controllerResult.getCount()).toBe(serviceResult[1]);
    });
  });

  describe('findOne', () => {
    it('findOne should return one Comment', async () => {
      const fakeId = comment.comment_id;
      jest.spyOn(commentService, 'findOne').mockImplementation(async () => comment);

      expect(await commentController.findOne(fakeId)).toBe(comment);
    });

    it('findOne should return a not found exception', async () => {
      const fakeId = comment.comment_id;
      const exception = new ObjectNotFoundException('Comment not found with id : ' + comment.comment_id, 404);
      jest.spyOn(commentService, 'findOne').mockImplementation(async () => null);
      try {
        await commentController.findOne(fakeId);
      } catch (e) {
        expect(e).toEqual(exception);
      }
    });
  });

  describe('create', () => {
    it('create should return created comment', async () => {
      const result: ObjectResponseCreate<Comment> = new ObjectResponseCreate<Comment>(comment, 'The comment has been created successfully');

      const dto: CreateCommentDTO = {
        event_id: event.event_id,
        user_id: user.user_id,
        message: 'fake comment'
      };
      jest.spyOn(userService, 'findOne').mockImplementation(async () => user);
      jest.spyOn(eventService, 'findOne').mockImplementation(async () => event);
      jest.spyOn(commentService, 'create').mockImplementation(async () => comment);

      expect(await commentController.create(dto)).toEqual(result);
    });
  });

  describe('update', () => {
    it('update should return an comment_id and a successful comment', async () => {
      const result: ObjectResponseUpdate = new ObjectResponseUpdate(comment.comment_id, 'The comment has been updated successfully');
      const dto: UpdateCommentDTO = {
        comment_id: '1',
        message: 'Fake edited message'
      };
      jest.spyOn(commentService, 'findOne').mockImplementation(async () => comment);
      jest.spyOn(commentService, 'patch').mockImplementation(async () => comment);

      expect(await commentController.update(comment.comment_id, dto)).toEqual(result);
    });

    it('update should return a not found exception', async () => {
      const exception = new ObjectNotFoundException('Comment not found with id : ' + comment.comment_id, 404);
      const dto: UpdateCommentDTO = {
        comment_id: comment.comment_id,
        message: 'Fake edited message'
      };
      jest.spyOn(commentService, 'findOne').mockImplementation(async () => null);

      try {
        await commentController.update(comment.comment_id, dto);
      } catch (e) {
        expect(e).toEqual(exception);
      }
    });
  });

  describe('delete', () => {
    it('delete should return the comment_id and a successful comment of deletion', async () => {
      const result: ObjectResponseUpdate = new ObjectResponseUpdate(comment.comment_id, 'The comment has been deleted successfully');
      jest.spyOn(commentService, 'findOne').mockImplementation(async () => comment);
      jest.spyOn(commentService, 'delete').mockImplementation(async () => null);

      expect(await commentController.delete(comment.comment_id)).toEqual(result);
    });

    it('delete should return a not found exception', async () => {
      const exception = new ObjectNotFoundException('Comment not found with id : ' + comment.comment_id, 404);
      jest.spyOn(commentService, 'findOne').mockImplementation(async () => null);

      try {
        await commentController.delete(comment.comment_id);
      } catch (e) {
        expect(e).toEqual(exception);
      }
    });
  });
});
