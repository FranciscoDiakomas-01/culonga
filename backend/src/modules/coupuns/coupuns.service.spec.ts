import { Test, TestingModule } from '@nestjs/testing';
import { CoupunsService } from './coupuns.service';

describe('CoupunsService', () => {
  let service: CoupunsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoupunsService],
    }).compile();

    service = module.get<CoupunsService>(CoupunsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
