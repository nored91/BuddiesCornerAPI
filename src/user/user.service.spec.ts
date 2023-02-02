import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../app.module';
import { DeleteResult, Repository } from 'typeorm';
import { Pagination } from '../common/object/pagination.object';
import { User } from './user.entity';
import { UserFilter } from './user.filter';
import { UserService } from './user.service';
import { CreateUserDTO, UpdateUserDTO } from './user.dto';

describe('userService', () => {
  let userRepository: Repository<User>;
  let userService: UserService;

  const user: User = {
    user_id: '1',
    mail: 'fake@gmail.com',
    firstname: 'fake',
    lastname: 'fake',
    pseudo: 'fake',
    password: '',
    active: true,
    creation_date: new Date('2023-01-16 15:11:06.000')
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    userService = await moduleRef.resolve(UserService);
    userRepository = await moduleRef.get(getRepositoryToken(User));
  });

  describe('findAll', () => {
    it('findAll should return an array of User', async () => {
      const pagination: Pagination = { limit: 1, offset: 0 };
      const queryFilter: UserFilter = new UserFilter();
      const TypeOrmResult: [User[], number] = [[user], 1];
      jest.spyOn(userRepository, 'findAndCount').mockImplementationOnce(async () => TypeOrmResult);
      const result = await userService.findAll(pagination, queryFilter);

      expect(result).toEqual(TypeOrmResult);
    });
  });

  describe('findOne', () => {
    it('findOne should return one User', async () => {
      const fakeId = user.user_id;
      jest.spyOn(userRepository, 'findOneBy').mockImplementationOnce(async () => user);

      expect(await userService.findOne(fakeId)).toBe(user);
    });
  });

  describe('create', () => {
    it('create should return created user', async () => {
      const dto: CreateUserDTO = {
        mail: 'fake@gmail.com',
        firstname: 'fake',
        lastname: 'fake',
        pseudo: 'fake',
        password: 'fake'
      };
      jest.spyOn(userRepository, 'save').mockImplementationOnce(async () => user);

      expect(await userService.create(dto)).toEqual(user);
    });
  });

  describe('update', () => {
    it('update should return user_id a successful message', async () => {
      const dto: UpdateUserDTO = {
        mail: 'fake@gmail.com',
        firstname: 'fake',
        lastname: 'fake',
        pseudo: 'fake',
        password: 'fake',
        user_id: user.user_id,
        active: true
      };
      jest.spyOn(userRepository, 'save').mockImplementationOnce(async () => user);

      expect(await userService.patch(dto)).toEqual(user);
    });
  });

  describe('delete', () => {
    it('delete should be called succesfully', async () => {
      const result:DeleteResult = {raw:1,affected:1}
      jest.spyOn(userRepository, 'delete').mockImplementationOnce(async () => result);
      expect(await userService.delete({ user_id: user.user_id})).toEqual(result);
    });
  });
});
