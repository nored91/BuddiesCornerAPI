import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
import { Group } from '../group/group.entity';

@Entity()
export class User {
  @ApiProperty({
    type: 'uuid',
    description: 'user id',
    example: 'c7107dbc-b962-45c7-a8b3-3e660211ca21',
    required: true
  })
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @ApiProperty({ type: String, description: 'user mail', example: 'notactivated@test.fr', required: true })
  @Column()
  mail: string;

  @ApiProperty({ type: String, description: 'user firstname', example: 'Jean-René', required: true })
  @Column()
  firstname: string;

  @ApiProperty({ type: String, description: 'user lastname', example: 'Dupond', required: true })
  @Column()
  lastname: string;

  @ApiProperty({ type: String, description: 'user pseudo', example: 'RobertDu38', required: true })
  @Column()
  pseudo: string;

  @ApiProperty({ type: String, description: 'user password', example: 'RobertDu38*', required: true })
  @Column({ nullable: false })
  password: string;

  @ApiProperty({ type: Boolean, description: 'user active state', example: true, default: false, required: false })
  @Column()
  active: boolean;

  @ApiProperty({
    type: Date,
    description: 'user creation date',
    example: '2023-01-16T14:33:20.000Z',
    default: 'date of the day',
    required: false
  })
  @Column()
  creation_date: Date;
}
