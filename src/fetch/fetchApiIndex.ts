import defaultFetch from './defaultFetch';

import { GenericIndex, ApiIndexResponse, fetchAdapter } from '../types/types';
import type DrupalState from '../DrupalState';

/**
 * Get an index of resource links for the API
 * @param apiRoot url to the root of JSON:API
 * @param fetch fetch compatible function
 * @returns a promise containing an object with an index of resource links
 */
const fetchApiIndex = (
  apiRoot: string,
  fetch: fetchAdapter = defaultFetch,
  onError: DrupalState['onError'] = (err: Error) => {
    throw err;
  }
): Promise<void | GenericIndex> => {
  const apiIndex = fetch(apiRoot)
    .then(response => {
      if (!response.ok) {
        throw new Error(
          `Failed to fetch API index.\nTried fetching: ${apiRoot}\nServer responded with status code: ${response.status}`
        );
      }
      return response.json() as Promise<ApiIndexResponse>;
    })
    .then(data => data.links || false)
    .catch(error => {
      // Pass error to custom onError handler
      onError(error);
    });
  return apiIndex as Promise<GenericIndex>;
};

export default fetchApiIndex;
