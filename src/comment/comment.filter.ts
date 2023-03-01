/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { GenericFilter } from '../common/object/filter';
import { EventFilter } from '../event/event.filter';
import { UserFilter } from '../user/user.filter';
import { Comment } from './comment.entity';

export class CommentFilter extends GenericFilter<Comment> {
  @ApiProperty({
    name: 'comment_id',
    description: 'Filter by comment id',
    type: String,
    example: '39048102-0e9b-46c7-9dd6-de34169e3ee1',
    required: false
  })
  @IsUUID()
  @IsOptional()
  public comment_id: string;

  @ApiProperty({
    name: 'user',
    description: 'Filter on creator user (fields : user_id, firstname & lastname)',
    type: UserFilter,
    required: false
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UserFilter)
  public user: UserFilter;

  @ApiProperty({
    name: 'event',
    description: 'Filter on group (fields : event_id, message & description)',
    type: EventFilter,
    required: false
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EventFilter)
  public event: EventFilter;

  @ApiProperty({ description: 'Filter by message', type: String, example: 'Babyfoot', required: false })
  @IsString()
  @IsOptional()
  public message: string;

  @ApiProperty({ description: 'Filter by edition date', type: Date, example: '2023-01-16', required: false })
  @IsOptional()
  @IsDate()
  public edition_date: string;

  @ApiProperty({ description: 'Filter by creation date', type: Date, example: '2023-01-16', required: false })
  @IsOptional()
  @IsDate()
  public creation_date: string;
}
