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
  test('A fetch failure throws an error', async () => {
    fetchMock.mock('https://dev-ds-demo.pantheonsite.io/jsonapi', {
      status: 404,
      body: {},
    });
    try {
      const result = await fetchJsonapiEndpoint(
        'https://dev-ds-demo.pantheonsite.io/jsonapi'
      );
      expect(result).toEqual(undefined);
      expect(result).toThrow();
    } catch (error) {
      expect(error instanceof Error && error.message).toEqual(
        `Failed to fetch JSON:API endpoint.\nTried fetching: https://dev-ds-demo.pantheonsite.io/jsonapi\nServer responded with status code: 404`
      );
    }
  });
});
