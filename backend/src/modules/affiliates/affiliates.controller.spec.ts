import { Test, TestingModule } from '@nestjs/testing';
import { AffiliatesController } from './affiliates.controller';
import { AffiliatesService } from './affiliates.service';

describe('AffiliatesController', () => {
  let controller: AffiliatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AffiliatesController],
      providers: [AffiliatesService],
    }).compile();

    controller = module.get<AffiliatesController>(AffiliatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
