import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../../app.module';
import { DeleteResult, FindManyOptions, Repository } from 'typeorm';
import { Pagination } from '../../common/object/pagination.object';
import { Comment } from '../comment.entity';
import { CommentFilter } from '../comment.filter';
import { CommentService } from '../comment.service';
import { CreateCommentDTO, UpdateCommentDTO } from '../comment.dto';
import { Event, EventType } from '../../event/event.entity';
import { User } from '../../user/user.entity';
import { Filter } from '../../common/object/filter';

describe('commentService', () => {
  let commentRepository: Repository<Comment>;
  let commentService: CommentService;
  let eventRepository: Repository<Event>;
  let userRepository: Repository<User>;

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
      imports: [AppModule]
    }).compile();
    commentService = await moduleRef.resolve(CommentService);
    commentRepository = await moduleRef.get(getRepositoryToken(Comment));
    eventRepository = await moduleRef.get(getRepositoryToken(Event));
    userRepository = await moduleRef.get(getRepositoryToken(User));
  });

  describe('findAll', () => {
    it('findAll should return an array of Comment', async () => {
      const pagination: Pagination = { limit: 1, offset: 0 };
      const queryFilter: CommentFilter = new CommentFilter();
      const TypeOrmResult: [Comment[], number] = [[comment], 1];
      jest.spyOn(commentRepository, 'findAndCount').mockImplementationOnce(async () => TypeOrmResult);
      const result = await commentService.findAll(pagination, queryFilter);

      expect(result).toEqual(TypeOrmResult);
    });

    it('findAll with no typeRelation in filter (eq,ilike) should return eq by default', async () => {
      let options: FindManyOptions = {};
      const queryFilter: CommentFilter = new CommentFilter();
      queryFilter.comment_id = '1';
      const commentFilterOption = {
        entityTypeFilter: [{ typeRelation: null, fields: ['comment_id', 'event_id', 'type'] }]
      };
      const filter: Filter<Comment> = new Filter<Comment>(queryFilter, commentFilterOption);
      options.where = filter.renderFilterOptionWhere();

      expect(options.where).toMatchObject({ comment_id: '1' });
    });
  });

  describe('findOne', () => {
    it('findOne should return one Comment', async () => {
      const fakeId = comment.comment_id;
      jest.spyOn(commentRepository, 'findOne').mockImplementationOnce(async () => comment);

      expect(await commentService.findOne(fakeId)).toBe(comment);
    });
  });

  describe('create', () => {
    it('create should return created comment', async () => {
      const dto: CreateCommentDTO = {
        event_id: event.event_id,
        user_id: user.user_id,
        message: 'Fake comment'
      };
      jest.spyOn(userRepository, 'findOne').mockImplementation(async () => user);
      jest.spyOn(eventRepository, 'findOne').mockImplementation(async () => event);
      jest.spyOn(commentRepository, 'save').mockImplementationOnce(async () => comment);
      jest.spyOn(commentRepository, 'findOne').mockImplementationOnce(async () => comment);

      expect(await commentService.create(dto)).toEqual(comment);
    });
  });

  describe('update', () => {
    it('update should return comment_id a successful comment', async () => {
      const dto: UpdateCommentDTO = {
        comment_id: '1',
        message: 'Fake edited message'
      };
      jest.spyOn(commentRepository, 'save').mockImplementationOnce(async () => comment);

      expect(await commentService.patch(dto)).toEqual(comment);
    });
  });

  describe('delete', () => {
    it('delete should be called succesfully', async () => {
      const result: DeleteResult = { raw: 1, affected: 1 };
      jest.spyOn(commentRepository, 'delete').mockImplementationOnce(async () => result);
      expect(await commentService.delete({ comment_id: comment.comment_id })).toEqual(result);
    });
  });
});
