import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { User } from './user/user.entity';
import { EventModule } from './event/event.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'buddiescorner',
      entities: [User, Event],
      synchronize: false,
      logging: ['error', 'info', 'log'] //"query","schema","error","warn","info","log","migration"
    }),
    UserModule,
    EventModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
