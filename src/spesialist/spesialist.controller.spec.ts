import { Test, TestingModule } from '@nestjs/testing';
import { SpesialistController } from './spesialist.controller';
import { SpesialistService } from './spesialist.service';

describe('SpesialistController', () => {
  let controller: SpesialistController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpesialistController],
      providers: [SpesialistService],
    }).compile();

    controller = module.get<SpesialistController>(SpesialistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
