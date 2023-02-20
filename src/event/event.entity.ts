import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Group } from '../group/group.entity';
import { User } from '../user/user.entity';

export enum EventType {
  sport = 'sport',
  party = 'party',
  other = 'other',
  vacation = 'vacation'
}

@Entity()
export class Event {
  @ApiProperty({
    type: 'uuid',
    description: 'event id',
    example: 'c7107dbc-b962-45c7-a8b3-3e660211ca21',
    required: true
  })
  @PrimaryGeneratedColumn('uuid')
  event_id: string;

  @ApiProperty({
    type: 'Group',
    description: 'group',
    example: '',
    required: true
  })
  @ManyToOne(() => Group)
  @JoinColumn({ name: 'group_id', referencedColumnName: 'group_id' })
  group: Group;

  @ApiProperty({
    type: 'User',
    description: 'creator user',
    example: '',
    required: true
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_user_id', referencedColumnName: 'user_id' })
  creator_user: User;

  @ApiProperty({
    type: 'enum',
    description: 'type',
    example: 'party',
    required: true
  })
  @Column({
    type: 'enum',
    enum: EventType
  })
  type: EventType;

  @ApiProperty({ type: String, description: 'title', example: 'sortie', required: true })
  @Column()
  title: string;

  @ApiProperty({ type: String, description: 'description', example: 'Sortie au café des jeux', required: false })
  @Column()
  description: string;

  @ApiProperty({ type: String, description: 'location', example: 'Grenoble', required: false })
  @Column()
  location: string;

  @ApiProperty({
    type: Date,
    description: 'user creation date',
    example: '2023-01-16T14:33:20.000Z',
    default: 'date of the day',
    required: false
  })
  @Column()
  creation_date: Date;

  @ApiProperty({
    type: Date,
    description: 'event date',
    example: '2023-01-16T14:33:20.000Z',
    default: 'date of the event',
    required: false
  })
  @Column()
  event_date: Date;
}
