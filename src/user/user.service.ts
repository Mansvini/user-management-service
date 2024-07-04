import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  create(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  update(id: number, user: User): Promise<any> {
    return this.userRepository.update(id, user);
  }

  remove(id: number): Promise<void> {
    return this.userRepository.delete(id).then(() => undefined);
  }

  async search(
    username?: string,
    minAge?: number,
    maxAge?: number,
  ): Promise<User[]> {
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

    return queryBuilder.getMany();
  }
}
