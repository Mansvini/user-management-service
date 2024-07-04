import { Controller, Post, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { BlockService } from './block.service';
import { UserId } from '../common/user-id.decorator';

@Controller('block')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Post(':blockedId')
  block(
    @UserId() blockerId: number,
    @Param('blockedId', ParseIntPipe) blockedId: number,
  ) {
    return this.blockService.blockUser(blockerId, blockedId);
  }

  @Delete(':blockedId')
  unblock(
    @UserId() blockerId: number,
    @Param('blockedId', ParseIntPipe) blockedId: number,
  ) {
    return this.blockService.unblockUser(blockerId, blockedId);
  }
}
