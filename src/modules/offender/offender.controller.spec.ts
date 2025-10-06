import { Test, TestingModule } from '@nestjs/testing';
import { OffenderController } from './offender.controller';
import { OffenderService } from './offender.service';

describe('OffenderController', () => {
  let controller: OffenderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OffenderController],
      providers: [OffenderService],
    }).compile();

    controller = module.get<OffenderController>(OffenderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
