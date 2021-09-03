import fetch from 'cross-fetch';
import { JsonapiResponse } from '../types/interfaces';

/**
 * fetch data from a JSON:API endpoint
 * @param apiUrl the api url for the JON:API endpoint
 * @returns a promise containing the data for the JSON:API response
 */
const fetchJsonapiEndpoint = (
  apiUrl: string
): Promise<void | JsonapiResponse> => {
  const collection = fetch(apiUrl)
    .then(response => response.json() as Promise<JsonapiResponse>)
    .then(data => data)
    .catch(error => console.error('JSON:API fetch failed', error));
  return collection;
};

export default fetchJsonapiEndpoint;
