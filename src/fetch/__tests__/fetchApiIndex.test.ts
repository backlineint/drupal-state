jest.mock('isomorphic-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('isomorphic-fetch');

import fetchApiIndex from '../fetchApiIndex';
import indexResponse from './data/apiIndex.json';

const { links } = indexResponse;

describe('fetchApiIndex', () => {
  test('A valid index response returns links', async () => {
    fetchMock.mock('https://dev-ds-demo.pantheonsite.io/jsonapi', {
      status: 200,
      body: indexResponse,
    });
    expect(
      await fetchApiIndex('https://dev-ds-demo.pantheonsite.io/jsonapi')
    ).toEqual(links);
  });
  test('An invalid index response throws an error', async () => {
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/jsonapi',
      {
        status: 500,
        body: {},
      },
      { overwriteRoutes: true }
    );
    try {
      const result = await fetchApiIndex(
        'https://dev-ds-demo.pantheonsite.io/jsonapi'
      );
      expect(result).toThrow();
    } catch (error) {
      expect(error instanceof Error && error.message).toEqual(
        `Failed to fetch API index.\nTried fetching: https://dev-ds-demo.pantheonsite.io/jsonapi\nServer responded with status code: 500`
      );
    }
  });
});
