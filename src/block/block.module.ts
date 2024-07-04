import { Module } from '@nestjs/common';
import { BlockController } from './block.controller';
import { BlockService } from './block.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Block } from './block.entity';
import { User } from '../user/user.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [TypeOrmModule.forFeature([Block, User]), CacheModule.register()],
  controllers: [BlockController],
  providers: [BlockService],
})
export class BlockModule {}
