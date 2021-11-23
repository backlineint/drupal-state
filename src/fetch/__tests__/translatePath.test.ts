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

  // TODO - would be nice to test the error message as well
  test('A fetch failure returns undefined', async () => {
    fetchMock.mock(
      'https://demo-decoupled-bridge.lndo.site/router/translate-path?path=/recipes/fiery-chili-sauce&_format=json',
      {
        throws: new Error('fetch failed'),
      }
    );
    expect(
      await translatePath(
        'https://demo-decoupled-bridge.lndo.site/router/translate-path',
        '/recipes/fiery-chili-sauce',
        {},
        false
      )
    ).toEqual(undefined);
  });
});
