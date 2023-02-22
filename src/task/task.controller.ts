/* eslint-disable prettier/prettier */
import { Delete, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { Body, Controller, Get, Post, Query, UseFilters } from '@nestjs/common/decorators';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ObjectResponseRecord } from '../common/response/objectResponseRecord';
import { BadRequestExceptionValidation } from '../common/exception/badRequestExceptionValidation';
import { ObjectNotFoundException } from '../common/exception/objectNotFoundException';
import { ApiFilterQuery } from '../common/object/api-filter-query';
import { Pagination } from '../common/object/pagination.object';
import { ObjectResponseCreate } from '../common/response/objectResponseCreate';
import { ObjectResponseUpdate } from '../common/response/objectResponseUpdate';
import { CreateTaskDTO, UpdateTaskDTO } from './task.dto';
import { Task } from './task.entity';
import { TaskFilter } from './task.filter';
import { TaskService } from './task.service';
import { EventService } from '../event/event.service';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { Event } from '../event/event.entity';

@Controller('task')
@ApiTags('Task')
@UseFilters(ObjectNotFoundException)
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly eventService: EventService,
    private readonly userService: UserService
  ) {}

  @ApiFilterQuery('filter', TaskFilter)
  @ApiFilterQuery('page', Pagination)
  @ApiResponse({ status: 200, type: ObjectResponseRecord<Task>, description: 'A list of task' })
  @Get()
  async findAll(@Query('page') pagination: Pagination, @Query('filter') taskFilter: TaskFilter): Promise<ObjectResponseRecord<Task>> {
    return new ObjectResponseRecord<Task>(await this.taskService.findAll(pagination, taskFilter));
  }

  @ApiResponse({ status: 200, type: Task, description: 'Requested task' })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: 'No task found' })
  @Get('/:id')
  async findOne(@Param('id', ParseUUIDPipe) taskId: string): Promise<Task> {
    const task: Task = await this.taskService.findOne(taskId);
    if (task === null) {
      throw new ObjectNotFoundException('Task not found with id : ' + taskId, 404);
    }
    return task;
  }

  @ApiResponse({ status: 201, type: ObjectResponseCreate<Task>, description: 'The task has been created successfully' })
  @ApiResponse({ status: 400, type: BadRequestExceptionValidation, description: 'Bad Request - Validation failed' })
  @Post()
  async create(@Body() createTaskDTO: CreateTaskDTO): Promise<ObjectResponseCreate<Task>> {
    let event: Event = await this.eventService.findOne(createTaskDTO.event_id);
    if (event === null) {
      throw new ObjectNotFoundException('Event not found with id : ' + createTaskDTO.event_id, 404);
    }
    createTaskDTO.event = event;
    let user: User = await this.userService.findOne(createTaskDTO.user_id);
    if (user === null) {
      throw new ObjectNotFoundException('User not found with id : ' + createTaskDTO.user_id, 404);
    }
    createTaskDTO.user = user;
    return new ObjectResponseCreate(await this.taskService.create(createTaskDTO), 'The task has been created successfully');
  }

  @ApiResponse({ status: 200, type: ObjectResponseUpdate, description: 'The task has been updated successfully' })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: 'No task found' })
  @Patch('/:id')
  async update(@Param('id', ParseUUIDPipe) taskId: string, @Body() updateTaskDTO: UpdateTaskDTO): Promise<ObjectResponseUpdate> {
    updateTaskDTO.task_id = taskId;
    let task: Task = await this.taskService.findOne(taskId);
    if (task === null) {
      throw new ObjectNotFoundException('Task not found with id : ' + taskId, 404);
    }
    task = await this.taskService.patch(updateTaskDTO);
    return new ObjectResponseUpdate(task.task_id, 'The task has been updated successfully');
  }

  @ApiResponse({ status: 200, type: ObjectResponseUpdate, description: 'The task has been deleted successfully' })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: 'No task found' })
  @Delete('/:id')
  async delete(@Param('id', ParseUUIDPipe) taskId: string): Promise<ObjectResponseUpdate> {
    const task: Task = await this.taskService.findOne(taskId);
    if (task === null) {
      throw new ObjectNotFoundException('Task not found with id : ' + taskId, 404);
    }
    await this.taskService.delete({ task_id: taskId });
    return new ObjectResponseUpdate(taskId, 'The task has been deleted successfully');
  }
}
