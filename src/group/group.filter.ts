/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { GenericFilter } from '../common/object/filter';
import { Group } from './group.entity';

export class GroupFilter extends GenericFilter<Group> {
  @ApiProperty({
    name: 'group_id',
    description: 'Filter by group id',
    type: String,
    example: '39048102-0e9b-46c7-9dd6-de34169e3ee1',
    required: false
  })
  @IsUUID()
  @IsOptional()
  public group_id: string;

  @ApiProperty({ description: 'Filter by title', type: String, example: 'vacances', required: false })
  @IsString()
  @IsOptional()
  @Length(0, 100)
  public title: string;

  @ApiProperty({ description: 'Filter by description', type: String, example: 'vacances entre potes du lycée', required: false })
  @IsString()
  @IsOptional()
  @Length(0, 255)
  public description: string;
}
