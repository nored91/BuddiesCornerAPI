import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { User } from './user/user.entity';
import { Event } from './event/event.entity';
import { EventModule } from './event/event.module';
import { GroupModule } from './group/group.module';
import { Group } from './group/group.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'buddiescorner',
      entities: [User, Group, Event],
      synchronize: false,
      logging: ['error', 'info', 'log', 'query'] //"query","schema","error","warn","info","log","migration"
    }),
    UserModule,
    EventModule,
    GroupModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
