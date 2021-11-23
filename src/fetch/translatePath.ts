import { ServerResponse } from 'http';
import { TJsonApiBody } from 'jsona/lib/JsonaTypes';
import fetchJsonapiEndpoint from './fetchJsonapiEndpoint';

/**
 * helper function to make it easier to resolve a path to an entity ID
 * @param apiUrl the api url for the JON:API endpoint
 * @param path the path to the node
 * @param requestInit fetch initialization object
 * @param res response object
 * @returns a promise containing the data for the JSON:API response
 */
const translatePath = async (
  apiUrl: string,
  path: string,
  requestInit = {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _res: ServerResponse | boolean = false
): Promise<void | TJsonApiBody> => {
  const response = (await fetchJsonapiEndpoint(
    apiUrl + '?path=' + path + '&_format=json',
    requestInit,
    _res
  )) as TJsonApiBody;
  return response;
};

export default translatePath;
