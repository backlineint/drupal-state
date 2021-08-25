import fetch from 'isomorphic-fetch';
import { GenericIndex, ApiIndexResponse } from '../types/interfaces';

/**
 * Get an index of resource links for the API
 * @param apiRoot url to the root of JSON:API
 * @returns a promise containing an object with an index of resource links
 */
const fetchApiIndex = (apiRoot: string): Promise<void | GenericIndex> => {
  const apiIndex = fetch(apiRoot)
    .then(response => response.json() as Promise<ApiIndexResponse>)
    // TODO - improve error handling and return something other than undefined
    // if data.links does not exist
    .then(data => data.links || false)
    .catch(error => console.error(error));
  return apiIndex as Promise<GenericIndex>;
};

export default fetchApiIndex;
