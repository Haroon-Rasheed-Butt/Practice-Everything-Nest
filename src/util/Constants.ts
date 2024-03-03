export const AppConstants = {
  recentPersonsType: 'recent_persons',
  favoritePersonsType: 'favorite_persons',
  sourceApplication: 'NodeJS',
  rangeForFavoriteOrRecentPersons: 10,
}


export function mapToDtoGeneric(obj: any) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(mapToDtoGeneric);
  }

  const dtoObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelCaseKey = key.replace(/_([a-z0-9])/g, (_, match) => match.toUpperCase());
      if(obj[key] instanceof Date) {
        dtoObj[camelCaseKey] = mapToDtoGeneric(obj[key].toString());
      }else {
        dtoObj[camelCaseKey] = mapToDtoGeneric(obj[key]);
      }
    }
  }

  return dtoObj;
}

export function mapToEntityGeneric(obj: any) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(mapToEntityGeneric);
  }

  const entityObject = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeCaseKey = key.replace(/[A-Z]/g, match => `_${match.toLowerCase()}`);
      if(obj[key] instanceof Date) {
        entityObject[snakeCaseKey] = mapToEntityGeneric(obj[key].toString());
      }else {
        entityObject[snakeCaseKey] = mapToEntityGeneric(obj[key]);
      }
    }
  }

  return entityObject;
}
