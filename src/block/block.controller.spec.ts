import { Test, TestingModule } from '@nestjs/testing';
import { BlockController } from './block.controller';
import { BlockService } from './block.service';

const mockBlockService = () => ({
  blockUser: jest.fn(),
  unblockUser: jest.fn(),
});

describe('BlockController', () => {
  let controller: BlockController;
  let service: ReturnType<typeof mockBlockService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockController],
      providers: [{ provide: BlockService, useFactory: mockBlockService }],
    }).compile();

    controller = module.get<BlockController>(BlockController);
    service = module.get(BlockService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('block', () => {
    it('should call blockUser service with correct parameters', async () => {
      const blockerId = 1;
      const blockedId = 2;
      service.blockUser.mockResolvedValue({} as any);

      await controller.block(blockerId, blockedId);
      expect(service.blockUser).toHaveBeenCalledWith(blockerId, blockedId);
    });
  });

  describe('unblock', () => {
    it('should call unblockUser service with correct parameters', async () => {
      const blockerId = 1;
      const blockedId = 2;
      service.unblockUser.mockResolvedValue(null);

      await controller.unblock(blockerId, blockedId);
      expect(service.unblockUser).toHaveBeenCalledWith(blockerId, blockedId);
    });
  });
});
