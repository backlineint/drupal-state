jest.mock('isomorphic-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('isomorphic-fetch');

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
    ).toEqual(undefined);
  });
  // TODO - Test for fetch failure
});
