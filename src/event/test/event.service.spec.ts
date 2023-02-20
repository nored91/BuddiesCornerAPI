import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../../app.module';
import { DeleteResult, Repository } from 'typeorm';
import { Pagination } from '../../common/object/pagination.object';
import { Event, EventType } from '../event.entity';
import { EventFilter } from '../event.filter';
import { EventService } from '../event.service';
import { CreateEventDTO, UpdateEventDTO } from '../event.dto';
import { Group } from '../../group/group.entity';
import { GroupService } from '../../group/group.service';
import { User } from '../../user/user.entity';
import { UserService } from '../../user/user.service';

describe('eventService', () => {
  let eventRepository: Repository<Event>;
  let eventService: EventService;
  let groupRepository: Repository<Group>;
  let userRepository: Repository<User>;

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

  const group: Group = {
    group_id: '1',
    title: 'fake title',
    description: 'fake description',
    creation_date: new Date('2023-01-16 15:11:06.000')
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
    eventService = await moduleRef.resolve(EventService);
    eventRepository = await moduleRef.get(getRepositoryToken(Event));
    groupRepository = await moduleRef.get(getRepositoryToken(Group));
    userRepository = await moduleRef.get(getRepositoryToken(User));
  });

  describe('findAll', () => {
    it('findAll should return an array of Event', async () => {
      const pagination: Pagination = { limit: 1, offset: 0 };
      const queryFilter: EventFilter = new EventFilter();
      const TypeOrmResult: [Event[], number] = [[event], 1];
      jest.spyOn(eventRepository, 'findAndCount').mockImplementationOnce(async () => TypeOrmResult);
      const result = await eventService.findAll(pagination, queryFilter);

      expect(result).toEqual(TypeOrmResult);
    });
  });

  describe('findOne', () => {
    it('findOne should return one Event', async () => {
      const fakeId = event.event_id;
      jest.spyOn(eventRepository, 'findOne').mockImplementationOnce(async () => event);

      expect(await eventService.findOne(fakeId)).toBe(event);
    });
  });

  describe('create', () => {
    it('create should return created event', async () => {
      const dto: CreateEventDTO = {
        group_id: group.group_id,
        creator_user_id: user.user_id,
        title: 'fake event',
        description: 'fake event',
        location: 'grenoble',
        type: EventType.sport,
        event_date: '2023-03-16',
        group: group,
        creator_user: user
      };
      jest.spyOn(userRepository, 'findOne').mockImplementation(async () => user);
      jest.spyOn(groupRepository, 'findOne').mockImplementation(async () => group);
      jest.spyOn(eventRepository, 'save').mockImplementationOnce(async () => event);
      jest.spyOn(eventRepository, 'findOne').mockImplementationOnce(async () => event);

      expect(await eventService.create(dto)).toEqual(event);
    });
  });

  describe('update', () => {
    it('update should return event_id a successful message', async () => {
      const dto: UpdateEventDTO = {
        event_id: event.event_id,
        title: 'fake event',
        description: 'fake event',
        location: 'grenoble',
        type: EventType.sport,
        event_date: '2023-03-16'
      };
      jest.spyOn(eventRepository, 'save').mockImplementationOnce(async () => event);

      expect(await eventService.patch(dto)).toEqual(event);
    });
  });

  describe('delete', () => {
    it('delete should be called succesfully', async () => {
      const result: DeleteResult = { raw: 1, affected: 1 };
      jest.spyOn(eventRepository, 'delete').mockImplementationOnce(async () => result);
      expect(await eventService.delete({ event_id: event.event_id })).toEqual(result);
    });
  });
});
