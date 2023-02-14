/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, IsUUID, Length, ValidateNested } from 'class-validator';
import { Filter } from '../common/object/filter';
import { User } from '../user/user.entity';
import { UserFilter } from '../user/user.filter';
import { Event, EventType } from './event.entity';

export class EventFilter extends Filter<Event> {
  @ApiProperty({
    name: 'event_id',
    description: 'Filter by event id',
    type: String,
    example: '39048102-0e9b-46c7-9dd6-de34169e3ee1',
    required: false
  })
  @IsUUID()
  @IsOptional()
  public event_id: string;

  @ApiProperty({
    name: 'user',
    description: 'Filter on creator user (fields : user_id, firstname & lastname)',
    type: UserFilter,
    example: '',
    required: false
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UserFilter)
  public creator_user: UserFilter;

  @ApiProperty({
    name: 'group_id',
    description: 'Filter by group',
    type: String,
    example: '312a9f8f-5317-4dde-ba2d-a91fd98f3e09',
    required: false
  })
  @IsUUID()
  @IsOptional()
  public group_id: string;

  @ApiProperty({ description: 'Filter by title', type: String, example: 'Soirée au labo', required: false })
  @IsString()
  @IsOptional()
  public title: string;

  @ApiProperty({ description: 'Filter by description', type: String, example: 'Escalade', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 250)
  public description: string;

  @ApiProperty({ description: 'Filter by location', type: String, example: 'Grenoble', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  public location: string;

  @ApiProperty({ description: 'Filter by event date', type: Date, example: '2023-01-16', required: false })
  @IsOptional()
  @IsDate()
  public event_date: string;

  @ApiProperty({ description: 'Filter by creation date', type: Date, example: '2023-01-16', required: false })
  @IsOptional()
  @IsDate()
  public creation_date: string;

  @ApiProperty({ description: 'Filter by event type', isArray: true, enum: EventType, example: Object.keys(EventType), required: false })
  @IsOptional()
  @IsEnum(EventType)
  public type: EventType;
}
