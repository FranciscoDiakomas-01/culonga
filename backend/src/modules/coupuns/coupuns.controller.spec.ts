import { Test, TestingModule } from '@nestjs/testing';
import { CoupunsController } from './coupuns.controller';
import { CoupunsService } from './coupuns.service';

describe('CoupunsController', () => {
  let controller: CoupunsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoupunsController],
      providers: [CoupunsService],
    }).compile();

    controller = module.get<CoupunsController>(CoupunsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
