import { Module } from '@nestjs/common';
import { PersonalConfigurationsService } from './personal-configurations.service';
import { PersonalConfigurationsController } from './personal-configurations.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { PersonalConfigurations } from "./entities/personal-configuration.entity";
import { PersonModule } from "../person/person.module";

@Module({
  imports: [TypeOrmModule.forFeature([PersonalConfigurations]), PersonModule],
  controllers: [PersonalConfigurationsController],
  providers: [PersonalConfigurationsService],
})
export class PersonalConfigurationsModule {}
