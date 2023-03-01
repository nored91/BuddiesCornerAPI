import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination } from '../common/object/pagination.object';
import { DeleteResult, FindManyOptions, FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { CreateCommentDTO, UpdateCommentDTO } from './comment.dto';
import { Comment } from './comment.entity';
import { CommentFilter } from './comment.filter';
import { Filter, TypeRelation } from '../common/object/filter';

@Injectable()
export class CommentService {
  private select: string[] = [
    'comment_id',
    'message',
    'creation_date',
    'edition_date',
    'user.user_id',
    'user.firstname',
    'user.lastname',
    'event.event_id',
    'event.message',
    'event.description'
  ];
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>
  ) {}

  // eslint-disable-next-line prettier/prettier
  async findAll(pagination: Pagination, commentFilter: CommentFilter): Promise<[Comment[], number]> {
    let options: FindManyOptions = {
      select: this.select,
      skip: pagination.offset,
      relations: ['user', 'event'],
      relationLoadStrategy: 'query',
      take: pagination.limit
    };

    if (Object.keys(commentFilter).length > 0) {
      const commentFilterOption = {
        entityTypeFilter: [
          { typeRelation: TypeRelation.Eq, fields: ['comment_id', 'event_id'] },
          { typeRelation: TypeRelation.Ilike, fields: ['message', 'edition_date', 'creation_date'] },
          { relation: 'user', typeRelation: TypeRelation.Eq, fields: ['user_id'] },
          { relation: 'user', typeRelation: TypeRelation.Ilike, fields: ['mail', 'firstname', 'lastname'] },
          { relation: 'event', typeRelation: TypeRelation.Eq, fields: ['event_id'] },
          { relation: 'event', typeRelation: TypeRelation.Ilike, fields: ['title', 'description'] }
        ]
      };
      const filter: Filter<Comment> = new Filter<Comment>(commentFilter, commentFilterOption);
      options.where = filter.renderFilterOptionWhere();
    }

    return await this.commentRepository.findAndCount(options);
  }

  async findOne(id: string): Promise<Comment> {
    let options: FindOneOptions = {
      select: this.select,
      relations: ['user', 'event'],
      relationLoadStrategy: 'query',
      where: { comment_id: id }
    };
    return await this.commentRepository.findOne(options);
  }

  async create(createCommentDTO: CreateCommentDTO): Promise<Comment> {
    const comment = await this.commentRepository.save(createCommentDTO);
    return await this.findOne(comment.comment_id);
  }

  async patch(updateCommentDTO: UpdateCommentDTO): Promise<Comment> {
    return await this.commentRepository.save(updateCommentDTO);
  }

  async delete(options: FindOptionsWhere<Comment>): Promise<DeleteResult> {
    return await this.commentRepository.delete(options);
  }
}
