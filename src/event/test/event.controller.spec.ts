import { EventController } from '../event.controller';
import { EventService } from '../event.service';
import { Test } from '@nestjs/testing';
import { Pagination } from '../../common/object/pagination.object';
import { Event, EventType } from '../event.entity';
import { EventFilter } from '../event.filter';
import { ObjectResponseCreate } from '../../common/response/objectResponseCreate';
import { CreateEventDTO, UpdateEventDTO } from '../event.dto';
import { ObjectResponseUpdate } from '../../common/response/objectResponseUpdate';
import { ObjectNotFoundException } from '../../common/exception/objectNotFoundException';
import { ObjectResponseRecord } from '../../common/response/objectResponseRecord';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Group } from '../../group/group.entity';
import { User } from '../../user/user.entity';
import { UserService } from '../../user/user.service';
import { GroupService } from '../../group/group.service';

export const mockRepository = jest.fn(() => ({
  metadata: {
    columns: [],
    relations: []
  }
}));

describe('EventController', () => {
  let eventController: EventController;
  let eventService: EventService;
  let groupService: GroupService;
  let userService: UserService;

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
      providers: [
        EventService,
        UserService,
        GroupService,
        { useClass: mockRepository, provide: getRepositoryToken(Event) },
        { useClass: mockRepository, provide: getRepositoryToken(User) },
        { useClass: mockRepository, provide: getRepositoryToken(Group) }
      ],
      controllers: [EventController]
    }).compile();

    eventService = await moduleRef.resolve(EventService);
    groupService = await moduleRef.resolve(GroupService);
    userService = await moduleRef.resolve(UserService);
    eventController = await moduleRef.resolve(EventController);
  });

  describe('findAll', () => {
    it('findAll should return an array of Event', async () => {
      const pagination: Pagination = { limit: 1, offset: 0 };
      const queryFilter: EventFilter = new EventFilter();
      const serviceResult: [Event[], number] = [[], 0];
      const controllerResult: ObjectResponseRecord<Event> = new ObjectResponseRecord<Event>(serviceResult);
      jest.spyOn(eventService, 'findAll').mockImplementation(async () => serviceResult);
      const result = await eventController.findAll(pagination, queryFilter);

      expect(result).toEqual(controllerResult);
      expect(controllerResult.getRecords()).toBe(serviceResult[0]);
      expect(controllerResult.getCount()).toBe(serviceResult[1]);
    });
  });

  describe('findOne', () => {
    it('findOne should return one Event', async () => {
      const fakeId = event.event_id;
      jest.spyOn(eventService, 'findOne').mockImplementation(async () => event);

      expect(await eventController.findOne(fakeId)).toBe(event);
    });

    it('findOne should return a not found exception', async () => {
      const fakeId = event.event_id;
      const exception = new ObjectNotFoundException('Event not found with id : ' + event.event_id, 404);
      jest.spyOn(eventService, 'findOne').mockImplementation(async () => null);
      try {
        await eventController.findOne(fakeId);
      } catch (e) {
        expect(e).toEqual(exception);
      }
    });
  });

  describe('create', () => {
    it('create should return created event', async () => {
      const result: ObjectResponseCreate<Event> = new ObjectResponseCreate<Event>(event, 'The event has been created successfully');

      const dto: CreateEventDTO = {
        group_id: group.group_id,
        creator_user_id: user.user_id,
        title: 'fake event',
        description: 'fake event',
        location: 'grenoble',
        type: EventType.sport,
        event_date: '2023-03-16'
      };
      jest.spyOn(userService, 'findOne').mockImplementation(async () => user);
      jest.spyOn(groupService, 'findOne').mockImplementation(async () => group);
      jest.spyOn(eventService, 'create').mockImplementation(async () => event);

      expect(await eventController.create(dto)).toEqual(result);
    });
  });

  describe('update', () => {
    it('update should return an event_id and a successful message', async () => {
      const result: ObjectResponseUpdate = new ObjectResponseUpdate(event.event_id, 'The event has been updated successfully');
      const dto: UpdateEventDTO = {
        event_id: event.event_id,
        title: 'fake event',
        description: 'fake event',
        location: 'grenoble',
        type: EventType.sport,
        event_date: '2023-03-16'
      };
      jest.spyOn(eventService, 'findOne').mockImplementation(async () => event);
      jest.spyOn(eventService, 'patch').mockImplementation(async () => event);

      expect(await eventController.update(event.event_id, dto)).toEqual(result);
    });

    it('update should return a not found exception', async () => {
      const exception = new ObjectNotFoundException('Event not found with id : ' + event.event_id, 404);
      const dto: UpdateEventDTO = {
        event_id: event.event_id,
        title: 'fake event',
        description: 'fake event',
        location: 'grenoble',
        type: EventType.sport,
        event_date: '2023-03-16'
      };
      jest.spyOn(eventService, 'findOne').mockImplementation(async () => null);

      try {
        await eventController.update(event.event_id, dto);
      } catch (e) {
        expect(e).toEqual(exception);
      }
    });
  });

  describe('delete', () => {
    it('delete should return the event_id and a successful message of deletion', async () => {
      const result: ObjectResponseUpdate = new ObjectResponseUpdate(event.event_id, 'The event has been deleted successfully');
      jest.spyOn(eventService, 'findOne').mockImplementation(async () => event);
      jest.spyOn(eventService, 'delete').mockImplementation(async () => null);

      expect(await eventController.delete(event.event_id)).toEqual(result);
    });

    it('delete should return a not found exception', async () => {
      const exception = new ObjectNotFoundException('Event not found with id : ' + event.event_id, 404);
      jest.spyOn(eventService, 'findOne').mockImplementation(async () => null);

      try {
        await eventController.delete(event.event_id);
      } catch (e) {
        expect(e).toEqual(exception);
      }
    });
  });
});
