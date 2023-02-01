import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Test } from '@nestjs/testing';
import { Pagination } from '../common/object/pagination.object';
import { User } from './user.entity';
import { UserFilter } from './user.filter';
import { ObjectResponseCreate } from '../common/response/objectResponseCreate';
import { CreateUserDTO, UpdateUserDTO } from './user.dto';
import { AppModule } from '../app.module';
import { ObjectResponseUpdate } from '../common/response/objectResponseUpdate';
import { ObjectNotFoundException } from '../common/exception/objectNotFoundException';
import { ObjectResponseRecord } from '../common/response/objectResponseRecord';

describe('UserController', () => {
  let userController: UserController;
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
    userController = await moduleRef.resolve(UserController);
  });

  describe('findAll', () => {
    it('should return an array of User', async () => {
      const pagination: Pagination = { limit: 1, offset: 0 };
      const queryFilter: UserFilter = new UserFilter();
      const serviceResult: [User[], number] = [[], 0];
      const controllerResult: ObjectResponseRecord<User> = new ObjectResponseRecord<User>(serviceResult);
      jest.spyOn(userService, 'findAll').mockImplementation(async () => serviceResult);
      const result = await userController.findAll(pagination, queryFilter);

      expect(result).toEqual(controllerResult);
      expect(controllerResult.getRecords()).toBe(serviceResult[0]);
      expect(controllerResult.getCount()).toBe(serviceResult[1]);
    });
  });

  describe('findOne', () => {
    it('should return one User', async () => {
      const fakeId = user.user_id;
      jest.spyOn(userService, 'findOne').mockImplementation(async () => user);

      expect(await userController.findOne(fakeId)).toBe(user);
    });

    it('findOne should return a not found exception', async () => {
      const fakeId = user.user_id;
      const exception = new ObjectNotFoundException('User not found with id : ' + user.user_id, 404);
      jest.spyOn(userService, 'findOne').mockImplementation(async () => null);
      try {
        await userController.findOne(fakeId);
      } catch (e) {
        expect(e).toEqual(exception);
      }
    });
  });

  describe('create', () => {
    it('should return created user', async () => {
      const result: ObjectResponseCreate<User> = new ObjectResponseCreate<User>(
        user,
        'The user has been created successfully'
      );

      const dto: CreateUserDTO = {
        mail: 'fake@gmail.com',
        firstname: 'fake',
        lastname: 'fake',
        pseudo: 'fake',
        password: 'fake'
      };
      jest.spyOn(userService, 'create').mockImplementation(async () => user);

      expect(await userController.create(dto)).toEqual(result);
    });
  });

  describe('update', () => {
    it('should return user_id a successful message', async () => {
      const result: ObjectResponseUpdate = new ObjectResponseUpdate(
        user.user_id,
        'The user has been updated successfully'
      );
      const dto: UpdateUserDTO = {
        mail: 'fake@gmail.com',
        firstname: 'fake',
        lastname: 'fake',
        pseudo: 'fake',
        password: 'fake',
        user_id: user.user_id,
        active: true
      };
      jest.spyOn(userService, 'findOne').mockImplementation(async () => user);
      jest.spyOn(userService, 'patch').mockImplementation(async () => user);

      expect(await userController.update(user.user_id, dto)).toEqual(result);
    });

    it('update should return a not found exception', async () => {
      const exception = new ObjectNotFoundException('User not found with id : ' + user.user_id, 404);
      const dto: UpdateUserDTO = {
        mail: 'fake@gmail.com',
        firstname: 'fake',
        lastname: 'fake',
        pseudo: 'fake',
        password: 'fake',
        user_id: user.user_id,
        active: true
      };
      jest.spyOn(userService, 'findOne').mockImplementation(async () => null);

      try {
        await userController.update(user.user_id, dto);
      } catch (e) {
        expect(e).toEqual(exception);
      }
    });
  });
});