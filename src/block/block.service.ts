import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Block } from './block.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';

@Injectable()
export class BlockService {
  constructor(
    @InjectRepository(Block)
    private readonly blockRepository: Repository<Block>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
    return this.blockRepository.save(block);
  }

  async unblockUser(blockerId: number, blockedId: number): Promise<void> {
    await this.blockRepository.delete({
      blocker: { id: blockerId },
      blocked: { id: blockedId },
    });
  }
}
