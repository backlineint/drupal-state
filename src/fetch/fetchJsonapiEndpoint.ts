import { ServerResponse } from 'http';
import fetch from 'isomorphic-fetch';
import { TJsonApiBody } from 'jsona/lib/JsonaTypes';

/**
 * fetch data from a JSON:API endpoint
 * @param apiUrl the api url for the JSON:API endpoint
 * @param requestInit fetch initialization object
 * @param res response object
 * @returns a promise containing the data for the JSON:API response
 */
const fetchJsonapiEndpoint = (
  apiUrl: string,
  requestInit = {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _res?: ServerResponse | boolean
): Promise<void | TJsonApiBody> => {
  const collection = fetch(apiUrl, requestInit)
    .then(response => response.json() as Promise<TJsonApiBody>)
    .then(data => data)
    .catch(error => console.error('JSON:API fetch failed', error));
  return collection;
};

export default fetchJsonapiEndpoint;
