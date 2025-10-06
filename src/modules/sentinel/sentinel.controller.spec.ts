import { Test, TestingModule } from '@nestjs/testing';
import { SentinelController } from './sentinel.controller';

describe('SentinelController', () => {
  let controller: SentinelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SentinelController],
    }).compile();

    controller = module.get<SentinelController>(SentinelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
