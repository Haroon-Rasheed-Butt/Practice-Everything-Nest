import {HttpException, HttpStatus, Injectable, Logger, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import { JwtService } from '@nestjs/jwt';
import {Repository} from "typeorm";
import {Person} from "./entities/person.entity";
// import {ErrorLogsService} from "../error-logs/error-logs.service";
import { AppConstants, mapToDtoGeneric, mapToEntityGeneric } from "../util/Constants";
// import {ErrorLogsDto} from "../error-logs/error-logs.dto";
import {PersonDto} from "./dto/person.dto";

@Injectable()
export class PersonService {
  private readonly LOG = new Logger(PersonService.name);
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    // private readonly errorService: ErrorLogsService,
    private jwtService: JwtService
  ) {}

  async createUser(personDto: PersonDto){
    try{
      const person = await this.personRepository.save(mapToEntityGeneric(personDto) as Person);
      this.LOG.log(`person created`);
      return mapToDtoGeneric(person);
    }catch (err){
      this.LOG.error(`Error while creating person`);
      throw err;
    }
  }

  async findOne(personDto: PersonDto) {
    try{
      if(!personDto.userName || !personDto.password){
        throw new HttpException(`Missing input parameters. Either username or password is missing`, HttpStatus.BAD_REQUEST);
      }
      const person = await this.personRepository.createQueryBuilder('persons').where({
        user_name: personDto.userName,
        password: personDto.password
      }).getOne();
      if(!person){
        throw new HttpException(`User with these credentials does not exist`, HttpStatus.NOT_FOUND);
      }
      // const payload = { sub: person.id, username: person.user_name };
      // const  access_token = await this.jwtService.signAsync(payload);
      const {password, ...result } = person;
      return mapToDtoGeneric(result);
    }catch (err) {
      this.LOG.log(`error while finding user against credentials`);
      // await this.errorService.save(new ErrorLogsDto(AppConstants.sourceApplication, err.message, `${this.findOne.name.toString()} in ${UserService.name.toString()}}`))
      throw err;
    }
  }

  async searchPersonByLinkId(linkId: number): Promise<PersonDto> {
    try{
      if(!linkId){
        throw new HttpException(`Missing parameters. LinkId not provided`, HttpStatus.BAD_REQUEST);
      }
      const person = await this.personRepository.findOneBy({link_id: linkId});
      return mapToDtoGeneric(person) as PersonDto;

    }catch (err) {
      this.LOG.log(`error while finding user against credentials`);
      // await this.errorService.save(new ErrorLogsDto(AppConstants.sourceApplication, err.message, `${this.findOne.name.toString()} in ${UserService.name.toString()}}`))
      throw err;
    }
  }

}
