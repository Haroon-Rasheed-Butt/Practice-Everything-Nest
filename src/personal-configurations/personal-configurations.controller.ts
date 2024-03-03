import {Controller, Get, Body, HttpStatus, Put, Query} from '@nestjs/common';
import { AppConstants } from '../util/Constants';
import { PersonalConfigurationsService } from "./personal-configurations.service";
import { PersonalConfigurationsDto } from "./dto/personal-configuration.dto";
import { PersonDto } from "../person/dto/person.dto";
import { ResponseEntity } from "../Common/ResponseEntity";
@Controller('personal-configurations')
export class PersonalConfigurationsController {
  constructor(private readonly personalConfigurationsService: PersonalConfigurationsService) {}


  /**
   * @description Searches for the record based on given user id in dto. If found, Updates the record as per given fields and their values. Else, creates a new record
   * @param personalConfigurationsDto the dto having values to be updated
   */
  @Put()
  async update(@Body() personalConfigurationsDto: PersonalConfigurationsDto) {
    let configurationsDto = await this.personalConfigurationsService.updatePersonalConfigurations(personalConfigurationsDto);
    return new ResponseEntity(configurationsDto, HttpStatus.OK, 'Successful');
  }

  /**
   * @description Finds the lastViewed Person of the given user
   * @param userId the id of user logged in
   * @returns Promise<Person[]> A promise containing an array of all recently viewed persons
   */
  @Get('/user/last-viewed')
  async findLastViewedPerson(@Query('userId') userId: any) {
    const persons: PersonDto[] = await this.personalConfigurationsService.findLastViewedOrFavoritePersons(userId, AppConstants.recentPersonsType);
    return new ResponseEntity(persons, HttpStatus.OK, 'Successful');
  }

  /**
   * @description updates the recent_persons against a userId
   * @param userId the user id against which to update
   * @param lastViewedPerson the person id to add in last viewed of the user
   * @returns Promise<ResponseEntity<{updated:boolean}>>  A response telling whether the person was updated or not
   */
  @Put('/user/update/last-viewed')
  async updateLastViewedPerson(@Query ('userId') userId: string, @Query ('lastViewedPerson') lastViewedPerson: string){
    let response = await this.personalConfigurationsService.updateLastViewedOrFavoritePerson(userId, lastViewedPerson, true, AppConstants.recentPersonsType);
    return new ResponseEntity({updated: response}, HttpStatus.OK, 'Successful');
  }

  /**
   * @description Finds the Favorite Persons of the given user
   * @param userId the id of user logged in
   * @returns Promise<Person[]> A promise containing an array of all favorite persons
   */
  @Get('/user/favorites')
  async findFavoritePerson(@Query('userId') userId: any) {
    const persons: PersonDto[] = await this.personalConfigurationsService.findLastViewedOrFavoritePersons(userId, AppConstants.favoritePersonsType);
    return new ResponseEntity(persons, HttpStatus.OK, 'Successful');
  }

  /**
   * @description updates the recent_persons against a userId
   * @param userId the user id against which to update
   * @param favoritePerson the person id to add in favorites of the user
   * @param isFavorite A boolean value which tells whether to add as a favorite or remove from favorites based on true and false value respectively
   * @returns Promise<ResponseEntity<{updated:boolean}>>  A response telling whether the person was updated or not
   */
  @Put('/user/update/favorites')
  async updateFavoritePerson(@Query ('userId') userId: string, @Query ('favoritePerson') favoritePerson: string, @Query ('isFavorite') isFavorite: boolean){
    let response = await this.personalConfigurationsService.updateLastViewedOrFavoritePerson(userId, favoritePerson, isFavorite, AppConstants.favoritePersonsType);
    return new ResponseEntity({updated: response}, HttpStatus.OK, 'Successful');
  }
}
