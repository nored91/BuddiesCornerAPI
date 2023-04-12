import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Group {
  @ApiProperty({
    type: 'uuid',
    description: 'group id',
    example: 'c7107dbc-b962-45c7-a8b3-3e660211ca21',
    required: true
  })
  @PrimaryGeneratedColumn('uuid')
  group_id: string;

  @ApiProperty({ type: String, description: 'group title', example: 'vacances', required: true })
  @Column()
  title: string;

  @ApiProperty({ type: String, description: 'user description', example: 'vacances entre potes du lycée', required: false })
  @Column()
  description: string;

  @ApiProperty({
    type: Date,
    description: 'group creation date',
    example: '2023-01-16T14:33:20.000Z',
    default: 'date of the day',
    required: false
  })
  @Column()
  creation_date: Date;
}
