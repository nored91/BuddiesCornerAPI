import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from '../group/group.entity';
import { GroupService } from '../group/group.service';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { EventController } from './event.controller';
import { Event } from './event.entity';
import { EventService } from './event.service';

@Module({
  imports: [TypeOrmModule.forFeature([Event, User, Group])],
  controllers: [EventController],
  providers: [EventService, UserService, GroupService]
})
export class EventModule {}
