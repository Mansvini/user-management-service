import { Controller, Post, Delete, Param } from '@nestjs/common';
import { BlockService } from './block.service';

@Controller('block')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Post(':blockerId/:blockedId')
  block(
    @Param('blockerId') blockerId: number,
    @Param('blockedId') blockedId: number,
  ) {
    return this.blockService.blockUser(blockerId, blockedId);
  }

  @Delete(':blockerId/:blockedId')
  unblock(
    @Param('blockerId') blockerId: number,
    @Param('blockedId') blockedId: number,
  ) {
    return this.blockService.unblockUser(blockerId, blockedId);
  }
}
