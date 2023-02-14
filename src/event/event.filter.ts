/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID, ValidationError } from 'class-validator';
import { BadRequestExceptionValidation } from '../common/exception/badRequestExceptionValidation';
import { Filter } from '../common/object/filter';
import { Event } from './event.entity';

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
    name: 'mail',
    description: 'Filter by mail',
    type: String,
    example: 'toto.test@gmail.com',
    required: false
  })
  @IsString()
  @IsOptional()
  public mail: string;

  @ApiProperty({ description: 'Filter by firstname', type: String, example: 'Jean-René', required: false })
  @IsString()
  @IsOptional()
  public firstname: string;

  @ApiProperty({ description: 'Filter by lastname', type: String, example: 'Dupont', required: false })
  @IsString()
  @IsOptional()
  public lastname: string;

  @ApiProperty({ description: 'Filter by pseudo', type: String, example: 'RobertDu38', required: false })
  @IsString()
  @IsOptional()
  public pseudo: string;

  @ApiProperty({ description: 'Filter by activation state', type: Boolean, example: true, required: false })
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch (e) {
      let error: ValidationError[] = [{ property: 'active', constraints: { active: 'active must be a boolean value' } }];
      throw new BadRequestExceptionValidation(error);
    }
  })
  @IsBoolean()
  public active: boolean;
}
