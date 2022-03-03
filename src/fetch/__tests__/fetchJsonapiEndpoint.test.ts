jest.mock('isomorphic-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('isomorphic-fetch');
fetchMock.config.overwriteRoutes = true;

import fetchJsonapiEndpoint from '../fetchJsonapiEndpoint';
import response from './data/collection.json';

describe('fetchJsonapiEndpoint', () => {
  test('A valid collection response returns data', async () => {
    fetchMock.mock('https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe', {
      status: 200,
      body: response,
    });
    expect(
      await fetchJsonapiEndpoint(
        'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe'
      )
    ).toEqual(response);
  });
  test('Request init object is honored', async () => {
    const requestInit = {
      headers: {
        Authorization: 'Bearer TOKEN',
      },
    };
    fetchMock.mock(
      {
        url: 'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe',
        headers: requestInit.headers,
      },
      {
        status: 200,
        body: response,
      }
    );
    expect(
      await fetchJsonapiEndpoint(
        'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe',
        requestInit
      )
    ).toEqual(response);
  });

  // TODO - would be nice to test the error message as well
  test('A fetch failure returns undefined', async () => {
    fetchMock.mock('https://dev-ds-demo.pantheonsite.io/jsonapi', {
      throws: new Error('fetch failed'),
    });
    expect(
      await fetchJsonapiEndpoint('https://dev-ds-demo.pantheonsite.io/jsonapi')
    ).toEqual(undefined);
  });
});
