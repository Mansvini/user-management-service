import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CACHE_MANAGER, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { Block } from 'src/block/block.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Block)
    private readonly blockRepository: Repository<Block>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    await this.cacheManager.del('users_all');
    return this.userRepository.save(createUserDto);
  }

  @CacheKey('users_all')
  @CacheTTL(300)
  async findAll(): Promise<User[]> {
    const cachedUsers = await this.cacheManager.get<User[]>('users_all');
    if (cachedUsers) {
      return cachedUsers;
    }
    const users = await this.userRepository.find();
    await this.cacheManager.set('users_all', users, 0);
    return users;
  }

  @CacheKey('users_one')
  @CacheTTL(300)
  async findOne(id: number): Promise<User> {
    const cachedUser = await this.cacheManager.get<User>(`user_${id}`);
    if (cachedUser) {
      return cachedUser;
    }
    const user = await this.userRepository.findOne({ where: { id } });
    await this.cacheManager.set(`user_${id}`, user, 0);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<any> {
    await this.cacheManager.del('users_all');
    await this.cacheManager.del(`user_${id}`);
    const result = await this.userRepository.update(id, updateUserDto);
    return result;
  }

  async remove(id: number): Promise<void> {
    await this.cacheManager.del('users_all');
    await this.cacheManager.del(`user_${id}`);
    await this.userRepository.delete(id);
  }

  @CacheKey('search')
  @CacheTTL(300)
  async search(
    username?: string,
    minAge?: number,
    maxAge?: number,
    userId?: number,
  ): Promise<User[]> {
    const cacheKey = `search_${username}_${minAge}_${maxAge}`;
    const cachedSearchResults = await this.cacheManager.get<User[]>(cacheKey);
    if (cachedSearchResults) {
      return cachedSearchResults;
    }

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (username) {
      queryBuilder.andWhere('user.username LIKE :username', {
        username: `%${username}%`,
      });
    }

    if (minAge && maxAge) {
      const today = new Date();
      const minBirthdate = new Date(
        today.setFullYear(today.getFullYear() - maxAge),
      );
      const maxBirthdate = new Date(
        today.setFullYear(today.getFullYear() - minAge),
      );
      queryBuilder.andWhere(
        'user.birthdate BETWEEN :minBirthdate AND :maxBirthdate',
        {
          minBirthdate,
          maxBirthdate,
        },
      );
    } else if (minAge) {
      const maxBirthdate = new Date();
      maxBirthdate.setFullYear(maxBirthdate.getFullYear() - minAge);
      queryBuilder.andWhere('user.birthdate <= :maxBirthdate', {
        maxBirthdate,
      });
    } else if (maxAge) {
      const minBirthdate = new Date();
      minBirthdate.setFullYear(minBirthdate.getFullYear() - maxAge);
      queryBuilder.andWhere('user.birthdate >= :minBirthdate', {
        minBirthdate,
      });
    }

    if (userId) {
      const blockedUsers = await this.blockRepository.find({
        where: { blocker: { id: userId } },
      });
      const blockedUserIds = blockedUsers.map((block) => block.blocked.id);
      if (blockedUserIds.length > 0) {
        queryBuilder.andWhere('user.id NOT IN (:...blockedUserIds)', {
          blockedUserIds,
        });
      }
    }

    const users = await queryBuilder.getMany();
    await this.cacheManager.set(cacheKey, users, 0);
    return users;
  }
}
