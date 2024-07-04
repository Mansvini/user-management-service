import { Module } from '@nestjs/common';
import { BlockController } from './block.controller';
import { BlockService } from './block.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Block } from './block.entity';
import { User } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Block, User])],
  controllers: [BlockController],
  providers: [BlockService],
})
export class BlockModule {}
