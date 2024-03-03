import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PersonalConfigurationsModule } from './personal-configurations/personal-configurations.module';
import { PersonModule } from './person/person.module';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Person } from "./person/entities/person.entity";
import { PersonalConfigurations } from "./personal-configurations/entities/personal-configuration.entity";

@Module({

  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: 'admin',
      database: 'nest-api-db',
      entities: [Person, PersonalConfigurations],
      synchronize: true,
    }),
    PersonalConfigurationsModule, PersonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
