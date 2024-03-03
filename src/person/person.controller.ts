import { Controller, Post, Body, HttpStatus } from "@nestjs/common";
import { PersonService } from './person.service';
import { PersonDto } from "./dto/person.dto";
import { ResponseEntity } from "../Common/ResponseEntity";

@Controller('person')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post()
  async createUser(@Body() personDto: PersonDto){
    const person = await this.personService.createUser(personDto);
    return new ResponseEntity(person, HttpStatus.OK, 'Successful');
  }

  @Post('/login')
  async findOne(@Body() userDto: PersonDto) {
     const person = await this.personService.findOne(userDto);
     return new ResponseEntity(person, HttpStatus.OK, 'Successful');
  }
}
