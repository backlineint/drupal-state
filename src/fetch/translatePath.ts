import { ServerResponse } from 'http';
import fetchJsonapiEndpoint from './fetchJsonapiEndpoint';
import defaultFetch from './defaultFetch';

import { TJsonApiBody } from 'jsona/lib/JsonaTypes';
import { fetchAdapter } from '../types/types';
import type DrupalState from '../DrupalState';

/**
 * helper function to make it easier to resolve a path to an entity ID
 * @param apiUrl the api url for the JON:API endpoint
 * @param path the path to the node
 * @param requestInit fetch initialization object
 * @param res response object
 * @param fetch fetch compatible function
 * @returns a promise containing the data for the JSON:API response
 */
const translatePath = async (
  apiUrl: string,
  path: string,
  requestInit = {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  res: ServerResponse | boolean = false,
  fetch: fetchAdapter = defaultFetch,
  onError: DrupalState['onError'] = (err: Error) => {
    throw err;
  }
): Promise<void | TJsonApiBody> => {
  const response = (await fetchJsonapiEndpoint(
    apiUrl + '?path=' + path + '&_format=json',
    requestInit,
    onError,
    res,
    fetch
  )) as TJsonApiBody;
  return response;
};

export default translatePath;
