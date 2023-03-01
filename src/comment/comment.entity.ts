import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, JoinTable } from 'typeorm';
import { User } from '../user/user.entity';
import { Event } from '../event/event.entity';

@Entity()
export class Comment {
  @ApiProperty({
    type: 'uuid',
    description: 'comment id',
    example: 'c7107dbc-b962-45c7-a8b3-3e660211ca21',
    required: true
  })
  @PrimaryGeneratedColumn('uuid')
  comment_id: string;

  @ApiHideProperty()
  @Column()
  event_id?: string;

  @ApiProperty({
    type: Event,
    description: 'event',
    required: true
  })
  @ManyToOne(() => Event)
  @JoinColumn({ name: 'event_id', referencedColumnName: 'event_id' })
  event: Event;

  @ApiHideProperty()
  @Column()
  user_id?: string;

  @ApiProperty({
    type: User,
    description: 'creator',
    required: true
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  @JoinTable()
  user: User;

  @ApiProperty({ type: String, description: 'message', example: 'Ok pour la soirée', required: true })
  @Column()
  message: string;

  @ApiProperty({
    type: Date,
    description: 'creation date',
    example: '2023-01-16T14:33:20.000Z',
    default: 'date of the day',
    required: false
  })
  @Column()
  creation_date: Date;

  @ApiProperty({
    type: Date,
    description: 'edition date',
    example: '2023-01-16T14:33:20.000Z',
    default: 'date of the last edition',
    required: false
  })
  @Column()
  edition_date: Date;
}
