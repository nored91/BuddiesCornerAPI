import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { User } from './user/user.entity';
import { Event } from './event/event.entity';
import { Comment } from './comment/comment.entity';
import { EventModule } from './event/event.module';
import { GroupModule } from './group/group.module';
import { Group } from './group/group.entity';
import { GroupUserModule } from './groupUser/groupUser.module';
import { GroupUser } from './groupUser/groupUser.entity';
import { Task } from './task/task.entity';
import { TaskModule } from './task/task.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'buddiescorner',
      entities: [User, Group, Event, Task, Comment, GroupUser],
      synchronize: false,
      logging: ['error', 'warn', 'log'] //"query","schema","error","warn","info","log","migration"
    }),
    UserModule,
    EventModule,
    GroupModule,
    GroupUserModule,
    TaskModule,
    CommentModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
