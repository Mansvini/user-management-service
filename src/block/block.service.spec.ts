import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BlockService } from './block.service';
import { Block } from './block.entity';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

const mockBlockRepository = () => ({
  save: jest.fn(),
  delete: jest.fn(),
});

const mockUserRepository = () => ({
  findOne: jest.fn(),
});

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  store: {
    keys: jest.fn(),
  },
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('BlockService', () => {
  let service: BlockService;
  let blockRepository: MockRepository<Block>;
  let userRepository: MockRepository<User>;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockService,
        { provide: getRepositoryToken(Block), useFactory: mockBlockRepository },
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<BlockService>(BlockService);
    blockRepository = module.get<MockRepository<Block>>(
      getRepositoryToken(Block),
    );
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('blockUser', () => {
    it('should block a user and clear the cache', async () => {
      const blocker = { id: 1 } as User;
      const blocked = { id: 2 } as User;
      const block = { id: 1, blocker, blocked } as Block;

      userRepository.findOne.mockResolvedValueOnce(blocker);
      userRepository.findOne.mockResolvedValueOnce(blocked);
      blockRepository.save.mockResolvedValue(block);

      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue(['search_1']);
      jest.spyOn(cacheManager, 'del').mockResolvedValue(null);

      const result = await service.blockUser(1, 2);
      expect(result).toEqual(block);
      expect(blockRepository.save).toHaveBeenCalledWith({ blocker, blocked });
      expect(cacheManager.del).toHaveBeenCalledWith('search_1');
    });
  });

  describe('unblockUser', () => {
    it('should unblock a user and clear the cache', async () => {
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue(['search_1']);
      jest.spyOn(cacheManager, 'del').mockResolvedValue(null);

      await service.unblockUser(1, 2);
      expect(blockRepository.delete).toHaveBeenCalledWith({
        blocker: { id: 1 },
        blocked: { id: 2 },
      });
      expect(cacheManager.del).toHaveBeenCalledWith('search_1');
    });
  });
});
