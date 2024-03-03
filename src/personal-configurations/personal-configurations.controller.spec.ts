import { Test, TestingModule } from '@nestjs/testing';
import { PersonalConfigurationsController } from './personal-configurations.controller';
import { PersonalConfigurationsService } from './personal-configurations.service';

describe('PersonalConfigurationsController', () => {
  let controller: PersonalConfigurationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonalConfigurationsController],
      providers: [PersonalConfigurationsService],
    }).compile();

    controller = module.get<PersonalConfigurationsController>(PersonalConfigurationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
