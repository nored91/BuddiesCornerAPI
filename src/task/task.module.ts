import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventService } from '../event/event.service';
import { Event } from '../event/event.entity';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { TaskController } from './task.controller';
import { Task } from './task.entity';
import { TaskService } from './task.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, User, Event])],
  controllers: [TaskController],
  providers: [TaskService, UserService, EventService]
})
export class TaskModule {}
