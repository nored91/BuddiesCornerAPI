import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from '../group/group.entity';
import { GroupService } from '../group/group.service';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { GroupUserController } from './groupUser.controller';
import { GroupUser } from './groupUser.entity';
import { GroupUserService } from './groupUser.service';

@Module({
  imports: [TypeOrmModule.forFeature([GroupUser, User, Group])],
  controllers: [GroupUserController],
  providers: [GroupUserService, UserService, GroupService]
})
export class GroupUserModule {}
