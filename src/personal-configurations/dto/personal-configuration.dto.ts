
export class PersonalConfigurationsDto {
  id: number;
  userId?: string;
  userName?: string;
  favoritePersons?: object;
  recentPersons?: object;
  recordsPerPage?: number;
  lastLogin?: Date;
  lastLogout?: Date;
}