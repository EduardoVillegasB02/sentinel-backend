import { Test, TestingModule } from '@nestjs/testing';
import { BodycamController } from './bodycam.controller';
import { BodycamService } from './bodycam.service';

describe('BodycamController', () => {
  let controller: BodycamController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BodycamController],
      providers: [BodycamService],
    }).compile();

    controller = module.get<BodycamController>(BodycamController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
