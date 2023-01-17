import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column()
  mail: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column()
  pseudo: string;

  @Column({ nullable: false })
  password: string;

  @Column()
  active: boolean;

  @Column()
  creation_date: Date;
}
