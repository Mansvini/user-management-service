import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './user.entity';
import { Block } from '../block/block.entity';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const mockUserRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockReturnThis(),
  })),
});

const mockBlockRepository = () => ({
  find: jest.fn(),
});

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  store: {
    keys: jest.fn().mockResolvedValue([]),
  },
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let service: UserService;
  let userRepository: MockRepository<User>;
  let cacheManager: typeof mockCacheManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
        { provide: getRepositoryToken(Block), useFactory: mockBlockRepository },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
    cacheManager = module.get<typeof mockCacheManager>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user and invalidate the search cache', async () => {
      const createUserDto = {
        name: 'John',
        surname: 'Doe',
        username: 'johndoe',
        birthdate: new Date(),
      };
      const user = {
        id: 1,
        name: 'John',
        surname: 'Doe',
        username: 'johndoe',
        birthdate: new Date(),
      };

      userRepository.save.mockResolvedValue(user);
      cacheManager.del.mockResolvedValue(null);

      const result = await service.create(createUserDto);
      expect(result).toEqual(user);

      expect(cacheManager.del).toHaveBeenCalledWith('users_all');
    });
  });

  describe('findAll', () => {
    it('should return an array of users from cache if available', async () => {
      const users = [{ id: 1, name: 'John' }];
      cacheManager.get.mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(cacheManager.get).toHaveBeenCalledWith('users_all');
      expect(userRepository.find).not.toHaveBeenCalled();
    });

    it('should return an array of users from database and cache them if not cached', async () => {
      const users = [{ id: 1, name: 'John' }];
      cacheManager.get.mockResolvedValue(null);
      userRepository.find.mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(userRepository.find).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith('users_all', users);
    });
  });

  describe('findOne', () => {
    it('should return a user from cache if available', async () => {
      const user = { id: 1, name: 'John' };
      cacheManager.get.mockResolvedValue(user);

      const result = await service.findOne(1);
      expect(result).toEqual(user);
      expect(cacheManager.get).toHaveBeenCalledWith('user_1');
      expect(userRepository.findOne).not.toHaveBeenCalled();
    });

    it('should return a user from database and cache them if not cached', async () => {
      const user = { id: 1, name: 'John' };
      cacheManager.get.mockResolvedValue(null);
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne(1);
      expect(result).toEqual(user);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(cacheManager.set).toHaveBeenCalledWith('user_1', user);
    });
  });

  describe('update', () => {
    it('should update a user and invalidate the relevant cache', async () => {
      const updateUserDto = { name: 'John' };
      const result = { affected: 1 };

      userRepository.update.mockResolvedValue(result);
      cacheManager.del.mockResolvedValue(null);

      const updateResult = await service.update(1, updateUserDto);
      expect(updateResult).toEqual(result);
      expect(cacheManager.del).toHaveBeenCalledWith('users_all');
      expect(cacheManager.del).toHaveBeenCalledWith('user_1');
    });
  });

  describe('remove', () => {
    it('should delete a user and invalidate the relevant cache', async () => {
      cacheManager.del.mockResolvedValue(null);

      await service.remove(1);
      expect(userRepository.delete).toHaveBeenCalledWith(1);
      expect(cacheManager.del).toHaveBeenCalledWith('users_all');
      expect(cacheManager.del).toHaveBeenCalledWith('user_1');
    });
  });

  describe('search', () => {
    it('should return cached search results if available', async () => {
      const cachedResults = [{ id: 1, name: 'John' }];
      cacheManager.get.mockResolvedValue(cachedResults);

      const searchDto = { username: 'john', minAge: 20, maxAge: 30 };
      const result = await service.search(searchDto, 1);
      expect(result).toEqual(cachedResults);
      expect(cacheManager.get).toHaveBeenCalledWith('search_john_20_30_1');
      expect(userRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should fetch search results from database and cache them if not cached', async () => {
      const searchResults = [{ id: 1, name: 'John' }];
      const createQueryBuilderMock = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(searchResults),
      };
      userRepository.createQueryBuilder.mockReturnValue(createQueryBuilderMock);
      cacheManager.get.mockResolvedValue(null);

      const searchDto = { username: 'john', minAge: 20, maxAge: 30 };
      const result = await service.search(searchDto, 1);
      expect(result).toEqual(searchResults);
      expect(cacheManager.get).toHaveBeenCalledWith('search_john_20_30_1');
      expect(userRepository.createQueryBuilder).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(
        'search_john_20_30_1',
        searchResults,
      );
    });
  });
});
