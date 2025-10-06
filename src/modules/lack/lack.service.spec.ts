import { Test, TestingModule } from '@nestjs/testing';
import { LackService } from './lack.service';

describe('LackService', () => {
  let service: LackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LackService],
    }).compile();

    service = module.get<LackService>(LackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
