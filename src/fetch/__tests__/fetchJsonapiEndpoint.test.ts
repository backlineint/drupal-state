jest.mock('isomorphic-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('isomorphic-fetch');
fetchMock.config.overwriteRoutes = true;

import fetchJsonapiEndpoint from '../fetchJsonapiEndpoint';
import response from './data/collection.json';

describe('fetchJsonapiEndpoint', () => {
  test('A valid collection response returns data', async () => {
    fetchMock.mock('https://live-contentacms.pantheonsite.io/api/recipes', {
      status: 200,
      body: response,
    });
    expect(
      await fetchJsonapiEndpoint(
        'https://live-contentacms.pantheonsite.io/api/recipes'
      )
    ).toEqual(response);
  });
  // TODO - would be nice to test the error message as well
  test('A fetch failure returns undefined', async () => {
    fetchMock.mock('https://live-contentacms.pantheonsite.io/api', {
      throws: new Error('fetch failed'),
    });
    expect(
      await fetchJsonapiEndpoint('https://live-contentacms.pantheonsite.io/api')
    ).toEqual(undefined);
  });
});
