jest.mock('cross-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('cross-fetch');

import fetchApiIndex from '../fetchApiIndex';
import indexResponse from './data/apiIndex.json';

const { links } = indexResponse;

describe('fetchApiIndex', () => {
  test('A valid index response returns links', async () => {
    fetchMock.mock('https://live-contentacms.pantheonsite.io/api', {
      status: 200,
      body: indexResponse,
    });
    expect(
      await fetchApiIndex('https://live-contentacms.pantheonsite.io/api')
    ).toEqual(links);
  });
  test('An invalid index response does not', async () => {
    fetchMock.mock(
      'https://live-contentacms.pantheonsite.io/api',
      {
        status: 500,
        body: {},
      },
      { overwriteRoutes: true }
    );
    expect(
      await fetchApiIndex('https://live-contentacms.pantheonsite.io/api')
    ).toEqual(false);
  });
  // TODO - would be nice to test the error message as well
  test('A fetch failure returns undefined', async () => {
    fetchMock.mock(
      'https://live-contentacms.pantheonsite.io/api',
      { throws: new Error('fetch failed') },
      { overwriteRoutes: true }
    );
    expect(
      await fetchApiIndex('https://live-contentacms.pantheonsite.io/api')
    ).toEqual(undefined);
  });
});
