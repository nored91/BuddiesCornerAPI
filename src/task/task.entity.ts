import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, JoinTable } from 'typeorm';
import { User } from '../user/user.entity';
import { Event } from '../event/event.entity';

@Entity()
export class Task {
  @ApiProperty({
    type: 'uuid',
    description: 'task id',
    example: 'c7107dbc-b962-45c7-a8b3-3e660211ca21',
    required: true
  })
  @PrimaryGeneratedColumn('uuid')
  task_id: string;

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

  @ApiProperty({ type: String, description: 'title', example: "Apporter l'apéro", required: true })
  @Column()
  title: string;

  @ApiProperty({ type: Boolean, description: 'description', example: true, default: false, required: false })
  @Column()
  achieve: boolean;
}
