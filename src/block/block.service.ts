import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Block } from './block.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class BlockService {
  constructor(
    @InjectRepository(Block)
    private readonly blockRepository: Repository<Block>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async blockUser(blockerId: number, blockedId: number): Promise<Block> {
    const blocker = await this.userRepository.findOne({
      where: { id: blockerId },
    });
    const blocked = await this.userRepository.findOne({
      where: { id: blockedId },
    });
    const block = new Block();
    block.blocker = blocker;
    block.blocked = blocked;
    const result = this.blockRepository.save(block);
    await this.clearSearchCache(blockerId);
    return result;
  }

  async unblockUser(blockerId: number, blockedId: number): Promise<void> {
    await this.blockRepository.delete({
      blocker: { id: blockerId },
      blocked: { id: blockedId },
    });
    await this.clearSearchCache(blockerId);
  }

  private async clearSearchCache(userId: number): Promise<void> {
    const keys = await this.cacheManager.store.keys();
    const searchKeys = keys.filter(
      (key) => key.includes(`search_`) && key.includes(`_${userId}`),
    );
    await Promise.all(searchKeys.map((key) => this.cacheManager.del(key)));
  }
}
