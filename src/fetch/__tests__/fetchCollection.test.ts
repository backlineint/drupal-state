jest.mock('isomorphic-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('isomorphic-fetch');
fetchMock.config.overwriteRoutes = true;

import fetchCollection from '../fetchCollection';
import response from './data/collection.json';

describe('fetchApiIndex', () => {
  test('A valid collection response returns data', async () => {
    fetchMock.mock('https://live-contentacms.pantheonsite.io/api/recipes', {
      status: 200,
      body: response,
    });
    expect(
      await fetchCollection(
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
      await fetchCollection('https://live-contentacms.pantheonsite.io/api')
    ).toEqual(undefined);
  });
});
