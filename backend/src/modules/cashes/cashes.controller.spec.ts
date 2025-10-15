import { Test, TestingModule } from '@nestjs/testing';
import { CashesController } from './cashes.controller';
import { CashesService } from './cashes.service';

describe('CashesController', () => {
  let controller: CashesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CashesController],
      providers: [CashesService],
    }).compile();

    controller = module.get<CashesController>(CashesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
