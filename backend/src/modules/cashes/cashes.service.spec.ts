import { Test, TestingModule } from '@nestjs/testing';
import { CashesService } from './cashes.service';

describe('CashesService', () => {
  let service: CashesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CashesService],
    }).compile();

    service = module.get<CashesService>(CashesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
