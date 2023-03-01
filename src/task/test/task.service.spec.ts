import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../../app.module';
import { DeleteResult, FindManyOptions, Repository } from 'typeorm';
import { Pagination } from '../../common/object/pagination.object';
import { Task } from '../task.entity';
import { TaskFilter } from '../task.filter';
import { TaskService } from '../task.service';
import { CreateTaskDTO, UpdateTaskDTO } from '../task.dto';
import { Event, EventType } from '../../event/event.entity';
import { User } from '../../user/user.entity';
import { Filter } from '../../common/object/filter';

describe('taskService', () => {
  let taskRepository: Repository<Task>;
  let taskService: TaskService;
  let eventRepository: Repository<Event>;
  let userRepository: Repository<User>;

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
      imports: [AppModule]
    }).compile();
    taskService = await moduleRef.resolve(TaskService);
    taskRepository = await moduleRef.get(getRepositoryToken(Task));
    eventRepository = await moduleRef.get(getRepositoryToken(Event));
    userRepository = await moduleRef.get(getRepositoryToken(User));
  });

  describe('findAll', () => {
    it('findAll should return an array of Task', async () => {
      const pagination: Pagination = { limit: 1, offset: 0 };
      const queryFilter: TaskFilter = new TaskFilter();
      const TypeOrmResult: [Task[], number] = [[task], 1];
      jest.spyOn(taskRepository, 'findAndCount').mockImplementationOnce(async () => TypeOrmResult);
      const result = await taskService.findAll(pagination, queryFilter);

      expect(result).toEqual(TypeOrmResult);
    });

    it('findAll with no typeRelation in filter (eq,ilike) should return eq by default', async () => {
      let options: FindManyOptions = {};
      const queryFilter: TaskFilter = new TaskFilter();
      queryFilter.task_id = '1';
      const taskFilterOption = {
        entityTypeFilter: [{ typeRelation: null, fields: ['task_id', 'event_id', 'type'] }]
      };
      const filter: Filter<Task> = new Filter<Task>(queryFilter, taskFilterOption);
      options.where = filter.renderFilterOptionWhere();

      expect(options.where).toMatchObject({ task_id: '1' });
    });
  });

  describe('findOne', () => {
    it('findOne should return one Task', async () => {
      const fakeId = task.task_id;
      jest.spyOn(taskRepository, 'findOne').mockImplementationOnce(async () => task);

      expect(await taskService.findOne(fakeId)).toBe(task);
    });
  });

  describe('create', () => {
    it('create should return created task', async () => {
      const dto: CreateTaskDTO = {
        event_id: event.event_id,
        user_id: user.user_id,
        title: 'Apporter les salades'
      };
      jest.spyOn(userRepository, 'findOne').mockImplementation(async () => user);
      jest.spyOn(eventRepository, 'findOne').mockImplementation(async () => event);
      jest.spyOn(taskRepository, 'save').mockImplementationOnce(async () => task);
      jest.spyOn(taskRepository, 'findOne').mockImplementationOnce(async () => task);

      expect(await taskService.create(dto)).toEqual(task);
    });
  });

  describe('update', () => {
    it('update should return task_id a successful message', async () => {
      const dto: UpdateTaskDTO = {
        task_id: '1',
        achieve: true
      };
      jest.spyOn(taskRepository, 'save').mockImplementationOnce(async () => task);

      expect(await taskService.patch(dto)).toEqual(task);
    });
  });

  describe('delete', () => {
    it('delete should be called succesfully', async () => {
      const result: DeleteResult = { raw: 1, affected: 1 };
      jest.spyOn(taskRepository, 'delete').mockImplementationOnce(async () => result);
      expect(await taskService.delete({ task_id: task.task_id })).toEqual(result);
    });
  });
});
