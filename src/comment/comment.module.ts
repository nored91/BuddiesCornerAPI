import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventService } from '../event/event.service';
import { Event } from '../event/event.entity';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { CommentController } from './comment.controller';
import { Comment } from './comment.entity';
import { CommentService } from './comment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, User, Event])],
  controllers: [CommentController],
  providers: [CommentService, UserService, EventService]
})
export class CommentModule {}
