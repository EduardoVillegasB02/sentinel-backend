import { Test, TestingModule } from '@nestjs/testing';
import { BodycamService } from './bodycam.service';

describe('BodycamService', () => {
  let service: BodycamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BodycamService],
    }).compile();

    service = module.get<BodycamService>(BodycamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
