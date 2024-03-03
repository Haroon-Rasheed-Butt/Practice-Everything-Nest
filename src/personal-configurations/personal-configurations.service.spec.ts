import { Test, TestingModule } from '@nestjs/testing';
import { PersonalConfigurationsService } from './personal-configurations.service';

describe('PersonalConfigurationsService', () => {
  let service: PersonalConfigurationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PersonalConfigurationsService],
    }).compile();

    service = module.get<PersonalConfigurationsService>(PersonalConfigurationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
