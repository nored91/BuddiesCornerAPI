import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination } from '../common/object/pagination.object';
import { DeleteResult, FindManyOptions, FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { CreateTaskDTO, UpdateTaskDTO } from './task.dto';
import { Task } from './task.entity';
import { TaskFilter } from './task.filter';
import { Filter, TypeRelation } from '../common/object/filter';

@Injectable()
export class TaskService {
  private select: string[] = [
    'task_id',
    'title',
    'achieve',
    'user.user_id',
    'user.firstname',
    'user.lastname',
    'event.event_id',
    'event.title',
    'event.description'
  ];
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>
  ) {}

  // eslint-disable-next-line prettier/prettier
  async findAll(pagination: Pagination, taskFilter: TaskFilter): Promise<[Task[], number]> {
    let options: FindManyOptions = {
      select: this.select,
      skip: pagination.offset,
      relations: ['user', 'event'],
      relationLoadStrategy: 'query',
      take: pagination.limit
    };

    if (Object.keys(taskFilter).length > 0) {
      const taskFilterOption = {
        entityTypeFilter: [
          { typeRelation: TypeRelation.Eq, fields: ['task_id', 'event_id', 'achieve'] },
          { typeRelation: TypeRelation.Ilike, fields: ['title'] },
          { relation: 'user', typeRelation: TypeRelation.Eq, fields: ['user_id'] },
          { relation: 'user', typeRelation: TypeRelation.Ilike, fields: ['mail', 'firstname', 'lastname'] },
          { relation: 'event', typeRelation: TypeRelation.Eq, fields: ['event_id'] },
          { relation: 'event', typeRelation: TypeRelation.Ilike, fields: ['title', 'description'] }
        ]
      };
      const filter: Filter<Task> = new Filter<Task>(taskFilter, taskFilterOption);
      options.where = filter.renderFilterOptionWhere();
    }

    return await this.taskRepository.findAndCount(options);
  }

  async findOne(id: string): Promise<Task> {
    let options: FindOneOptions = {
      select: this.select,
      relations: ['user', 'event'],
      relationLoadStrategy: 'query',
      where: { task_id: id }
    };
    return await this.taskRepository.findOne(options);
  }

  async create(createTaskDTO: CreateTaskDTO): Promise<Task> {
    const task = await this.taskRepository.save(createTaskDTO);
    return await this.findOne(task.task_id);
  }

  async patch(updateTaskDTO: UpdateTaskDTO): Promise<Task> {
    return await this.taskRepository.save(updateTaskDTO);
  }

  async delete(options: FindOptionsWhere<Task>): Promise<DeleteResult> {
    return await this.taskRepository.delete(options);
  }
}
