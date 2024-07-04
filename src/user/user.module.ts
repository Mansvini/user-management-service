import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { Block } from 'src/block/block.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Block]), CacheModule.register()],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
