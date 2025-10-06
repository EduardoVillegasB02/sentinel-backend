import { Test, TestingModule } from '@nestjs/testing';
import { LackController } from './lack.controller';
import { LackService } from './lack.service';

describe('LackController', () => {
  let controller: LackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LackController],
      providers: [LackService],
    }).compile();

    controller = module.get<LackController>(LackController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
