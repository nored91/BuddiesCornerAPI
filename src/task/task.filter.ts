/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID, ValidateNested, ValidationError } from 'class-validator';
import { BadRequestExceptionValidation } from '../common/exception/badRequestExceptionValidation';
import { GenericFilter } from '../common/object/filter';
import { EventFilter } from '../event/event.filter';
import { UserFilter } from '../user/user.filter';
import { Task } from './task.entity';

export class TaskFilter extends GenericFilter<Task> {
  @ApiProperty({
    name: 'task_id',
    description: 'Filter by task id',
    type: String,
    example: '39048102-0e9b-46c7-9dd6-de34169e3ee1',
    required: false
  })
  @IsUUID()
  @IsOptional()
  public task_id: string;

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
  public user: UserFilter;

  @ApiProperty({
    name: 'event',
    description: 'Filter on group (fields : event_id, title & description)',
    type: EventFilter,
    example: '',
    required: false
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EventFilter)
  public event: EventFilter;

  @ApiProperty({ description: 'Filter by title', type: String, example: 'Réunir la cgnotte', required: false })
  @IsString()
  @IsOptional()
  public title: string;

  @ApiProperty({ description: 'Filter by achievement state', type: Boolean, example: true, required: false })
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch (e) {
      let error: ValidationError[] = [{ property: 'achieve', constraints: { achieve: 'achieve must be a boolean value' } }];
      throw new BadRequestExceptionValidation(error);
    }
  })
  @IsBoolean()
  public achieve: boolean;
}
