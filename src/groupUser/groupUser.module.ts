import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupUserController } from './groupUser.controller';
import { GroupUser } from './groupUser.entity';
import { GroupUserService } from './groupUser.service';

@Module({
  imports: [TypeOrmModule.forFeature([GroupUser])],
  controllers: [GroupUserController],
  providers: [GroupUserService]
})
export class GroupUserModule {}
