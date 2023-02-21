import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Group } from '../group/group.entity';
import { User } from '../user/user.entity';

@Entity('group_user')
export class GroupUser {
  @PrimaryColumn({ type: 'uuid' })
  group_id: string;

  @PrimaryColumn({ type: 'uuid' })
  user_id: string;

  @ApiProperty({
    type: 'uuid',
    description: 'group',
    example: '',
    required: true
  })
  @ManyToOne(() => Group)
  @JoinColumn({ name: 'group_id', referencedColumnName: 'group_id' })
  group: Group;

  @ApiProperty({
    type: 'uuid',
    description: 'user',
    example: '',
    required: true
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User;

  @ApiProperty({ type: Boolean, description: 'user is adminstrator of group', example: true, default: false, required: false })
  @Column()
  administrator: boolean;

  @ApiProperty({
    type: Date,
    description: 'user creation date',
    example: '2023-01-16T14:33:20.000Z',
    default: 'date of the day',
    required: false
  })
  @Column()
  join_date: Date;
}
