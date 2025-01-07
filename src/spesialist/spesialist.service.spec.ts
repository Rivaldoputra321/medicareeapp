import { Test, TestingModule } from '@nestjs/testing';
import { SpesialistService } from './spesialist.service';

describe('SpesialistService', () => {
  let service: SpesialistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpesialistService],
    }).compile();

    service = module.get<SpesialistService>(SpesialistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
