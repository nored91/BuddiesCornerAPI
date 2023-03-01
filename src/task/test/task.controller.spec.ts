import { TaskController } from '../task.controller';
import { TaskService } from '../task.service';
import { Test } from '@nestjs/testing';
import { Pagination } from '../../common/object/pagination.object';
import { Task } from '../task.entity';
import { TaskFilter } from '../task.filter';
import { ObjectResponseCreate } from '../../common/response/objectResponseCreate';
import { CreateTaskDTO, UpdateTaskDTO } from '../task.dto';
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

describe('TaskController', () => {
  let taskController: TaskController;
  let taskService: TaskService;
  let eventService: EventService;
  let userService: UserService;

  const task: Task = {
    task_id: '1',
    event: null,
    user: null,
    title: 'Apporter les salades - fake',
    achieve: false
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
        TaskService,
        UserService,
        EventService,
        { useClass: mockRepository, provide: getRepositoryToken(Task) },
        { useClass: mockRepository, provide: getRepositoryToken(User) },
        { useClass: mockRepository, provide: getRepositoryToken(Event) }
      ],
      controllers: [TaskController]
    }).compile();

    taskService = await moduleRef.resolve(TaskService);
    eventService = await moduleRef.resolve(EventService);
    userService = await moduleRef.resolve(UserService);
    taskController = await moduleRef.resolve(TaskController);
  });

  describe('findAll', () => {
    it('findAll should return an array of Task', async () => {
      const pagination: Pagination = { limit: 1, offset: 0 };
      const queryFilter: TaskFilter = new TaskFilter();
      const serviceResult: [Task[], number] = [[], 0];
      const controllerResult: ObjectResponseRecord<Task> = new ObjectResponseRecord<Task>(serviceResult);
      jest.spyOn(taskService, 'findAll').mockImplementation(async () => serviceResult);
      const result = await taskController.findAll(pagination, queryFilter);

      expect(result).toEqual(controllerResult);
      expect(controllerResult.getRecords()).toBe(serviceResult[0]);
      expect(controllerResult.getCount()).toBe(serviceResult[1]);
    });
  });

  describe('findOne', () => {
    it('findOne should return one Task', async () => {
      const fakeId = task.task_id;
      jest.spyOn(taskService, 'findOne').mockImplementation(async () => task);

      expect(await taskController.findOne(fakeId)).toBe(task);
    });

    it('findOne should return a not found exception', async () => {
      const fakeId = task.task_id;
      const exception = new ObjectNotFoundException('Task not found with id : ' + task.task_id, 404);
      jest.spyOn(taskService, 'findOne').mockImplementation(async () => null);
      try {
        await taskController.findOne(fakeId);
      } catch (e) {
        expect(e).toEqual(exception);
      }
    });
  });

  describe('create', () => {
    it('create should return created task', async () => {
      const result: ObjectResponseCreate<Task> = new ObjectResponseCreate<Task>(task, 'The task has been created successfully');

      const dto: CreateTaskDTO = {
        event_id: event.event_id,
        user_id: user.user_id,
        title: 'Apporter les salades'
      };
      jest.spyOn(userService, 'findOne').mockImplementation(async () => user);
      jest.spyOn(eventService, 'findOne').mockImplementation(async () => event);
      jest.spyOn(taskService, 'create').mockImplementation(async () => task);

      expect(await taskController.create(dto)).toEqual(result);
    });
  });

  describe('update', () => {
    it('update should return an task_id and a successful message', async () => {
      const result: ObjectResponseUpdate = new ObjectResponseUpdate(task.task_id, 'The task has been updated successfully');
      const dto: UpdateTaskDTO = {
        task_id: '1',
        achieve: true
      };
      jest.spyOn(taskService, 'findOne').mockImplementation(async () => task);
      jest.spyOn(taskService, 'patch').mockImplementation(async () => task);

      expect(await taskController.update(task.task_id, dto)).toEqual(result);
    });

    it('update should return a not found exception', async () => {
      const exception = new ObjectNotFoundException('Task not found with id : ' + task.task_id, 404);
      const dto: UpdateTaskDTO = {
        task_id: task.task_id,
        achieve: true
      };
      jest.spyOn(taskService, 'findOne').mockImplementation(async () => null);

      try {
        await taskController.update(task.task_id, dto);
      } catch (e) {
        expect(e).toEqual(exception);
      }
    });
  });

  describe('delete', () => {
    it('delete should return the task_id and a successful message of deletion', async () => {
      const result: ObjectResponseUpdate = new ObjectResponseUpdate(task.task_id, 'The task has been deleted successfully');
      jest.spyOn(taskService, 'findOne').mockImplementation(async () => task);
      jest.spyOn(taskService, 'delete').mockImplementation(async () => null);

      expect(await taskController.delete(task.task_id)).toEqual(result);
    });

    it('delete should return a not found exception', async () => {
      const exception = new ObjectNotFoundException('Task not found with id : ' + task.task_id, 404);
      jest.spyOn(taskService, 'findOne').mockImplementation(async () => null);

      try {
        await taskController.delete(task.task_id);
      } catch (e) {
        expect(e).toEqual(exception);
      }
    });
  });
});
