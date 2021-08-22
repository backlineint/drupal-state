import { CollectionResponse } from '../types/interfaces';

/**
 * fetch data for a specific collection from JSON:API
 * @param apiUrl the api url for the collection
 * @returns a promise containing the data for the collection response
 */
const fetchCollection = (
  apiUrl: string
): Promise<void | CollectionResponse> => {
  const collection = fetch(apiUrl)
    .then(response => response.json() as Promise<CollectionResponse>)
    .then(data => data)
    .catch(error => console.error(error));
  return collection;
};

export default fetchCollection;
