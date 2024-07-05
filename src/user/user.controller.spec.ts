import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { SearchUserDto } from './search-user.dto';

const mockUserService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  search: jest.fn(),
});

type MockUserService = Partial<Record<keyof UserService, jest.Mock>>;

describe('UserController', () => {
  let controller: UserController;
  let service: MockUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService() }],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(
      UserService,
    ) as unknown as MockUserService;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John',
        surname: 'Doe',
        username: 'johndoe',
        birthdate: new Date(),
      };
      const user = { id: 1, ...createUserDto };
      service.create.mockResolvedValue(user);

      const result = await controller.create(createUserDto);
      expect(result).toEqual(user);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [{ id: 1, name: 'John' }];
      service.findAll.mockResolvedValue(users);

      const result = await controller.findAll();
      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      const user = { id: 1, name: 'John' };
      service.findOne.mockResolvedValue(user);

      const result = await controller.findOne(1);
      expect(result).toEqual(user);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a user by ID', async () => {
      const updateUserDto: UpdateUserDto = { name: 'John' };
      const result = { affected: 1 };
      service.update.mockResolvedValue(result);

      const updateResult = await controller.update(1, updateUserDto);
      expect(updateResult).toEqual(result);
      expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should delete a user by ID', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('search', () => {
    it('should return search results', async () => {
      const searchDto: SearchUserDto = {
        username: 'john',
      };
      const users = [
        {
          id: 1,
          name: 'John',
          username: 'johndoe',
        },
      ];
      service.search.mockResolvedValue(users);

      const userId = 1;
      const result = await controller.search(searchDto, userId);
      expect(result).toEqual(users);
      expect(service.search).toHaveBeenCalledWith(searchDto, userId);
    });
  });
});
