jest.mock('isomorphic-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('isomorphic-fetch');
fetchMock.config.overwriteRoutes = true;

import translatePath from '../translatePath';
import response from './data/translatePathResponse.json';

describe('translatePath', () => {
  test('A valid translate path request returns data', async () => {
    fetchMock.mock(
      'https://demo-decoupled-bridge.lndo.site/router/translate-path?path=/recipes/fiery-chili-sauce&_format=json',
      {
        status: 200,
        body: response,
      }
    );
    expect(
      await translatePath(
        'https://demo-decoupled-bridge.lndo.site/router/translate-path',
        '/recipes/fiery-chili-sauce',
        {},
        false
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
        url: 'https://demo-decoupled-bridge.lndo.site/router/translate-path?path=/recipes/fiery-chili-sauce&_format=json',
        headers: requestInit.headers,
      },
      {
        status: 200,
        body: response,
      }
    );
    expect(
      await translatePath(
        'https://demo-decoupled-bridge.lndo.site/router/translate-path',
        '/recipes/fiery-chili-sauce',
        requestInit,
        false
      )
    ).toEqual(response);
  });
  test('A fetch failure throws an error', async () => {
    fetchMock.mock(
      'https://demo-decoupled-bridge.lndo.site/router/translate-path?path=/recipes/fiery-chili-sauce&_format=json',
      {
        status: 404,
        body: {},
      }
    );
    try {
      const result = await await translatePath(
        'https://demo-decoupled-bridge.lndo.site/router/translate-path',
        '/recipes/fiery-chili-sauce'
      );
      expect(result).toEqual(undefined);
      expect(result).toThrow();
    } catch (error) {
      expect(error instanceof Error && error.message).toEqual(
        `Failed to fetch JSON:API endpoint.\nTried fetching: https://demo-decoupled-bridge.lndo.site/router/translate-path?path=/recipes/fiery-chili-sauce&_format=json\nServer responded with status code: 404`
      );
    }
  });
});
