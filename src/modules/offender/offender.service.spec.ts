import { Test, TestingModule } from '@nestjs/testing';
import { OffenderService } from './offender.service';

describe('OffenderService', () => {
  let service: OffenderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OffenderService],
    }).compile();

    service = module.get<OffenderService>(OffenderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
