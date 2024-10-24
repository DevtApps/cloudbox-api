import { Test, TestingModule } from '@nestjs/testing';
import { BoxService } from './box.service';

describe('BoxService', () => {
  let service: BoxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoxService],
    }).compile();

    service = module.get<BoxService>(BoxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
