import { ServerResponse } from 'http';
import defaultFetch from './defaultFetch';

import { fetchAdapter } from '../types/types';
import type DrupalState from '../DrupalState';
/**
 * fetch data from a JSON:API endpoint
 * @param apiUrl the api url for the JSON:API endpoint
 * @param requestInit fetch initialization object
 * @param onError custom error handler defaults to throw error
 * @param _res response object
 * @param fetch fetch compatible function
 * @returns a promise containing the data for the JSON:API response
 */
const fetchJsonapiEndpoint = (
  apiUrl: string,
  requestInit = {},
  onError: DrupalState['onError'] = (err: Error) => {
    throw err;
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _res?: ServerResponse | boolean,
  fetch: fetchAdapter = defaultFetch
): Promise<void | Response> => {
  const collection = fetch(apiUrl, requestInit, _res)
    .then(response => {
      if (!response.ok) {
        throw new Error(
          `Failed to fetch JSON:API endpoint.\nTried fetching: ${apiUrl}\nServer responded with status code: ${response.status}`
        );
      }
      return response.json() as Promise<void | Response>;
    })
    .then(data => data)
    .catch(error => {
      // Pass error to custom onError handler
      onError(error);
    });

  return collection;
};

export default fetchJsonapiEndpoint;
