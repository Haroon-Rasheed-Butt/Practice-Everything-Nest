import {HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {Repository, UpdateResult} from 'typeorm';

import { AppConstants, mapToEntityGeneric } from "../util/Constants";
import { PersonService } from "../person/person.service";
import { PersonDto } from "../person/dto/person.dto";
import { PersonalConfigurations } from "./entities/personal-configuration.entity";
import { PersonalConfigurationsDto } from "./dto/personal-configuration.dto";

@Injectable()
export class PersonalConfigurationsService {
  private readonly LOG = new Logger(PersonalConfigurationsService.name);
  constructor(
    @InjectRepository(PersonalConfigurations)
    private readonly personalConfigurationsRepository: Repository<PersonalConfigurations>,
    private readonly personService: PersonService,
    // private readonly errorLogService: ErrorLogsService
  ) {
  }

  async create(personalConfigurationsDto: PersonalConfigurationsDto) {
    try {
      const createdEntityDefault = await this.personalConfigurationsRepository.save(this.mapToDefaultValues(personalConfigurationsDto));
      this.LOG.log(`UserPreference entity saved with id : ${createdEntityDefault.id}`);
      return createdEntityDefault;
    } catch (error) {
      this.LOG.error(`Error occurred while saving UserPreference entity : ${error.message}`);
      //await this.errorLogService.save(new ErrorLogsDto(AppConstants.sourceApplication, error.message, `${this.create.name.toString()} in user-preferences-service`))
      throw error;
    }
  }

  /**
   * @description Searches for the record based on given user id in dto. If found, Updates the record as per given fields and their values. Else, creates a new record
   * @param updateUserPreferenceDto the dto having values to be updated
   */
  async updatePersonalConfigurations(updateUserPreferenceDto: PersonalConfigurationsDto) : Promise<PersonalConfigurationsDto>{
    if(!updateUserPreferenceDto.userId) throw new HttpException(`User Id not provided in DTO`, HttpStatus.NO_CONTENT);
    try{
      const userId = updateUserPreferenceDto.userId;
      let user: PersonalConfigurationsDto = await this.findOneByUserId(userId);
      if (user){
        // overriding the fields to update, that are provided in update user-pref dto
        Object.keys(updateUserPreferenceDto).filter(key => updateUserPreferenceDto[key]).forEach(toUpdateKey => {
          user[toUpdateKey] = updateUserPreferenceDto[toUpdateKey]
        });
        this.LOG.log(`Updating the existing user record`);
        const updatedUserEntity: PersonalConfigurations = await this.update(user);
        return this.mapToDto(updatedUserEntity);
      }
      else {
        this.LOG.log(`Creating a new user record`);
        user = updateUserPreferenceDto;
        const createdUserEntity: PersonalConfigurations =  await this.create(user);
        return this.mapToDto(createdUserEntity);}

    }catch (error){
      this.LOG.log(`Error while updating the user-preference object`)
      //await this.errorLogService.save(new ErrorLogsDto(AppConstants.sourceApplication, error.message, `${this.updateUserPreference.name.toString()} ${UserPreferencesService.name}`))
      throw error;
    }
  }

  async update(createUserPreferenceDto: PersonalConfigurationsDto) {
    try {
      const updatedEntity : UpdateResult = await this.personalConfigurationsRepository
        .createQueryBuilder('user_preferences')
        .update(mapToEntityGeneric(createUserPreferenceDto))
        .where('user_preferences.user_id = :userId', {userId : createUserPreferenceDto.userId})
        .returning("*")
        .execute();
      this.LOG.log(`UserPreference entity updated against a userId`);
      return updatedEntity.raw[0];
    } catch (error) {
      this.LOG.error(`Error occurred while updating UserPreference entity : ${error.message}`);
      //await this.errorLogService.save(new ErrorLogsDto(AppConstants.sourceApplication, error.message, `${this.update.name.toString()} in user-preferences-service`))
      throw error;
    }
  }

  async findOneByUserId(userId: string) : Promise<PersonalConfigurationsDto> {
    try {
      if(!userId) throw new HttpException(`User Id not provided against user preference`, HttpStatus.NO_CONTENT);
      const personalConfigurations: PersonalConfigurations = await this.personalConfigurationsRepository.findOneBy({ user_id: userId });
      if(personalConfigurations){
        this.LOG.log(`user preference record found against given user id`);
        return this.mapToDto(personalConfigurations);
      }
      else {
        this.LOG.log(`User not found against user id`);
        return undefined;
      }
    } catch (error) {
      this.LOG.error(`Error occurred while getting UserPreference entity : ${error.message}`);
      //await this.errorLogService.save(new ErrorLogsDto(AppConstants.sourceApplication, error.message, `${this.findOneByUserId.name.toString()} in user-preferences-service`))
      throw error;
    }
  }

  public mapToDto(userPreference: PersonalConfigurations): PersonalConfigurationsDto {
    if (userPreference === null) {
      return new PersonalConfigurationsDto;
    }
    return {
      id: userPreference.id,
      userId: userPreference.user_id,
      userName: userPreference.user_name,
      favoritePersons: userPreference.favorite_persons,
      recentPersons: userPreference.recent_persons,
      lastLogin: userPreference.last_login,
      lastLogout: userPreference.last_logout
    }
  }

  /**
   * @description Finds the lastViewed Person of the given user from Verato if enabled, otherwise from healthcare API of GCP.
   * @param userId the id of user against which the recent and favorite persons will be fetched
   * @param personType type of persons to fetch, either favorite or recent
   * @returns Promise<Person[]> A promise containing an array of all recently viewed persons
   */
  async findLastViewedOrFavoritePersons(userId: string, personType: string) : Promise<PersonDto[]>  {
    if(userId){
      try{
        let persons: PersonDto[] = [];
        let userPrefResponse = await this.getPersonsFromUserPreferenceApis(userId, personType);// get persons from userPreference API
        this.LOG.log("linkId of persons retrieved successfully from DB");
        if(userPrefResponse[personType]){
          persons = await this.fetchPersonInfo(userPrefResponse, personType);
        }
        return persons;
      }catch (err){
        this.LOG.log(`Error while retrieving person information for user Id: ${userId}. Error: ${err.message}`);
        //await this.errorLogService.save(new ErrorLogsDto(AppConstants.sourceApplication, err.message, `${this.findLastViewedOrFavoritePersons.name.toString()} in user-preferences-service`))
        throw err;
      }
    }else{
      this.LOG.log("Error due to Invalid userId");
      //await this.errorLogService.save(new ErrorLogsDto(AppConstants.sourceApplication, "Invalid user Id", `${this.findLastViewedOrFavoritePersons.name.toString()} in user-preferences-service`))
      throw new Error("Invalid userId. Maybe null or not provided");
    }
  }

  /**
   * @description Updates the recent_persons or favorites against the specific userId.
   * @param userId the id of user against which the recent and favorite persons will be fetched
   * @param personToUpdate the id of person to add in the first position
   * @param addToExistingList A boolean value which tells whether to add as a favorite/recent_person or remove from favorites/recent_persons based on true and false value respectively
   * @param personType either recent or favorites
   */
  async updateLastViewedOrFavoritePerson(userId: string, personToUpdate: string, addToExistingList: boolean, personType: string) : Promise<boolean> {
    if(!userId || !personToUpdate) throw new Error(`Insufficient information to update. userId : ${userId} --- personToAdd:${personToUpdate}`);

    try{
      const userPreferenceResponse = await this.getPersonsFromUserPreferenceApis(userId, personType);
      this.LOG.log(`Persons Link Ids fetched successfully from DB`);
      let updatedPersons = addToExistingList ? this.addPersonToExistingList(userPreferenceResponse[personType], personToUpdate) : this.removePersonFromExistingList(userPreferenceResponse[personType], personToUpdate);
      let updateResponse = await this.addUpdatedLastViewedOrFavoritePersonsToPersonalConfigurations(userId, updatedPersons, personType);
      this.LOG.log(`Update call to DB completed for ${personType}`);
      return !!updateResponse;
    }catch (err){
      this.LOG.log(`Error while updating user ${personType} persons : ${err.message}`);
      //await this.errorLogService.save(new ErrorLogsDto(AppConstants.sourceApplication, err.message, `${this.updateLastViewedOrFavoritePerson.name.toString()} in user-preferences-service`))
      throw err;
    }
  }

  /**
   * @description This method makes sure there is no repetition of Ids and that the most recent one is placed in the first index
   * @param persons
   * @param personId
   */
  addPersonToExistingList(persons: any[], personId: string){
    const newPerson = { link_id: personId, last_interacted_date: new Date() };
    if(persons?.length) {
      // Check if the person with the given linkId already exists in the array
      const existingPersonIndex = persons.findIndex(person => person.link_id === personId);
      // If the person exists, update the last_interacted_date
      if (existingPersonIndex !== -1) {
        persons[existingPersonIndex].last_interacted_date = new Date();
        const [existingPerson] = persons.splice(existingPersonIndex, 1);
        persons.unshift(existingPerson);
      }
      else {
        // Add the new person to the beginning of the array
        persons.unshift(newPerson);

        // If the array length exceeds 10, remove the oldest person
        if (persons.length > AppConstants.rangeForFavoriteOrRecentPersons) {
          persons.pop(); // Remove the last element (oldest person)
        }
      }
    }
    else{
      return [newPerson];
    }
    this.LOG.log("Add person to existing list utility method executed");
    return persons;

  }

  /**
   * @description This method removes the personId from the existing list
   * @param persons
   * @param personToRemove
   */
  removePersonFromExistingList(persons: any[], personToRemove: string) {
    if(persons){
      persons = persons.filter(person => person.link_id !== personToRemove);
      this.LOG.log("Remove person from existing list utility method executed");
      return persons;
    }else{
      return [];
    }
  }

  /**
   * @description adds the updated value of recent person or favorite person into the database
   * @param userId id of user
   * @param updatedPersons the updated list of person
   * @param personType type of person either recent or favorites
   */
  async addUpdatedLastViewedOrFavoritePersonsToPersonalConfigurations(userId: string, updatedPersons: any, personType: string){
    try{
      let updateResponse: UpdateResult = await this.personalConfigurationsRepository.createQueryBuilder('userPref').update().set({[personType]: updatedPersons}).where("user_id = :userId", { userId: userId }).execute();
      this.LOG.log(`Person linkId updated in the existing list in DB`);
      return updateResponse?.affected;
    }catch (err){
      this.LOG.log(`Error while updating ${personType} against ${this.personalConfigurationsRepository.metadata.name}.user_id : ${userId} \n Error: ${err.message}`)
      //await this.errorLogService.save(new ErrorLogsDto(AppConstants.sourceApplication, err.message, `${this.addUpdatedLastViewedOrFavoritePersonsToUserPreferences.name.toString()} in user-preferences-service`))
      throw err
    }
  }


  /**
   * @description Retrieves the linkId of persons against the given user id
   * @param userId the user id against which the recent or favorite persons are fetched
   * @param personType type of persons to fetch, either favorite or recent
   * @returns Promise<string[]> returns an array of string having linkIds of favorite or recent persons
   */
  async getPersonsFromUserPreferenceApis(userId : string, personType: string) : Promise<any> {
    try{
      let emptyResponse = {[personType]: []};
      let response = await this.personalConfigurationsRepository.createQueryBuilder('user_pref').select(`user_pref.${personType}`).where('user_pref.user_id = :user_id', {user_id: userId}).getOne();
      return response || emptyResponse;
    }catch (err){
      this.LOG.log(`Error while getting person from user-preference API: ${err.message}`)
      //await this.errorLogService.save(new ErrorLogsDto(AppConstants.sourceApplication, err.message, `${this.getPersonsFromUserPreferenceApis.name.toString()} in user-preferences-service`))
      throw err;
    }
  }

  private mapToDefaultValues(userPreferenceDto: PersonalConfigurationsDto): PersonalConfigurations {
    if (userPreferenceDto.userId === null) {
      return new PersonalConfigurations;
    }
    return {
      id: userPreferenceDto.id,
      user_id: userPreferenceDto.userId,
      user_name: userPreferenceDto.userName,
      favorite_persons: userPreferenceDto.favoritePersons || [],
      recent_persons: userPreferenceDto.recentPersons || [],
      last_login:userPreferenceDto.lastLogin || new Date(),
      last_logout:userPreferenceDto.lastLogout
    }
  }

  /**
   * @description fetches person Info either from verato or gcp
   * @param userPrefResponse contain linkIds of persons that the user has viewed
   * @param personType type of person
   * @protected
   */
  protected async fetchPersonInfo(userPrefResponse: any, personType: string) {
    let promises: Promise<any>[] = [];
    for (const personInfo of userPrefResponse[personType]) {
      promises.push(this.personService.searchPersonByLinkId(personInfo.link_id).then(personResponse =>{
        let person : PersonDto = personResponse ? personResponse : undefined;
        person ? this.LOG.log("Person from GCP retrieved successfully!") : this.LOG.log("FAILED TO retrieve Person from GCP");
        return {...person, lastInteractedDate: personInfo.last_interacted_date};
      }));

    }
    return [...await Promise.all(promises)];
  }
}

// favoritePerson : [{link_id, last_interacted_date}]
// recentPerson : [{link_id, last_interacted_date}]