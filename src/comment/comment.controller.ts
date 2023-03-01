/* eslint-disable prettier/prettier */
import { BadRequestException, Delete, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { Body, Controller, Get, Post, Query, UseFilters } from '@nestjs/common/decorators';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ObjectResponseRecord } from '../common/response/objectResponseRecord';
import { BadRequestExceptionValidation } from '../common/exception/badRequestExceptionValidation';
import { ObjectNotFoundException } from '../common/exception/objectNotFoundException';
import { ApiFilterQuery } from '../common/object/api-filter-query';
import { Pagination } from '../common/object/pagination.object';
import { ObjectResponseCreate } from '../common/response/objectResponseCreate';
import { ObjectResponseUpdate } from '../common/response/objectResponseUpdate';
import { CreateCommentDTO, UpdateCommentDTO } from './comment.dto';
import { Comment } from './comment.entity';
import { CommentFilter } from './comment.filter';
import { CommentService } from './comment.service';
import { EventService } from '../event/event.service';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { Event } from '../event/event.entity';

@Controller('comment')
@ApiTags('Comment')
@UseFilters(ObjectNotFoundException)
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly eventService: EventService,
    private readonly userService: UserService
  ) {}

  @ApiFilterQuery('filter', CommentFilter)
  @ApiFilterQuery('page', Pagination)
  @ApiResponse({ status: 200, type: ObjectResponseRecord<Comment>, description: 'A list of comment' })
  @Get()
  async findAll(
    @Query('page') pagination: Pagination,
    @Query('filter') commentFilter: CommentFilter
  ): Promise<ObjectResponseRecord<Comment>> {
    return new ObjectResponseRecord<Comment>(await this.commentService.findAll(pagination, commentFilter));
  }

  @ApiResponse({ status: 200, type: Comment, description: 'Requested comment' })
  @ApiResponse({ status: 400, type: BadRequestException, description: 'Validation failed (uuid is expected)' })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: 'No comment found' })
  @Get('/:id')
  async findOne(@Param('id', ParseUUIDPipe) commentId: string): Promise<Comment> {
    const comment: Comment = await this.commentService.findOne(commentId);
    if (comment === null) {
      throw new ObjectNotFoundException('Comment not found with id : ' + commentId, 404);
    }
    return comment;
  }

  @ApiResponse({ status: 201, type: ObjectResponseCreate<Comment>, description: 'The comment has been created successfully' })
  @ApiResponse({ status: 400, type: BadRequestExceptionValidation, description: 'Bad Request - Validation failed' })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: 'Event/User not found' })
  @Post()
  async create(@Body() createCommentDTO: CreateCommentDTO): Promise<ObjectResponseCreate<Comment>> {
    let event: Event = await this.eventService.findOne(createCommentDTO.event_id);
    if (event === null) {
      throw new ObjectNotFoundException('Event not found with id : ' + createCommentDTO.event_id, 404);
    }
    let user: User = await this.userService.findOne(createCommentDTO.user_id);
    if (user === null) {
      throw new ObjectNotFoundException('User not found with id : ' + createCommentDTO.user_id, 404);
    }
    return new ObjectResponseCreate<Comment>(
      await this.commentService.create(createCommentDTO),
      'The comment has been created successfully'
    );
  }

  @ApiResponse({ status: 200, type: ObjectResponseUpdate, description: 'The comment has been updated successfully' })
  @ApiResponse({ status: 400, type: BadRequestException, description: 'Validation failed (uuid is expected)' })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: 'No comment found' })
  @Patch('/:id')
  async update(@Param('id', ParseUUIDPipe) commentId: string, @Body() updateCommentDTO: UpdateCommentDTO): Promise<ObjectResponseUpdate> {
    updateCommentDTO.comment_id = commentId;
    let comment: Comment = await this.commentService.findOne(commentId);
    if (comment === null) {
      throw new ObjectNotFoundException('Comment not found with id : ' + commentId, 404);
    }
    comment = await this.commentService.patch(updateCommentDTO);
    return new ObjectResponseUpdate(comment.comment_id, 'The comment has been updated successfully');
  }

  @ApiResponse({ status: 200, type: ObjectResponseUpdate, description: 'The comment has been deleted successfully' })
  @ApiResponse({ status: 400, type: BadRequestException, description: 'Validation failed (uuid is expected)' })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: 'No comment found' })
  @Delete('/:id')
  async delete(@Param('id', ParseUUIDPipe) commentId: string): Promise<ObjectResponseUpdate> {
    const comment: Comment = await this.commentService.findOne(commentId);
    if (comment === null) {
      throw new ObjectNotFoundException('Comment not found with id : ' + commentId, 404);
    }
    await this.commentService.delete({ comment_id: commentId });
    return new ObjectResponseUpdate(commentId, 'The comment has been deleted successfully');
  }
}
