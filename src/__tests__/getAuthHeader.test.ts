jest.mock('isomorphic-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('isomorphic-fetch');
fetchMock.config.overwriteRoutes = true;
global.Headers = fetchMock.Headers;

import DrupalState from '../DrupalState';

import response from '../fetch/__tests__/data/token.json';
import responseExpired from '../fetch/__tests__/data/tokenExpired.json';

const dsConfig = {
  apiBase: 'https://demo-decoupled-bridge.lndo.site',
  apiPrefix: 'en/jsonapi',
  clientId: '9adc9c69-fa3b-4c21-9cef-fbd345d1a269',
  clientSecret: 'mysecret',
};

describe('getAuthHeader', () => {
  beforeEach(() => {
    fetchMock.mockClear();
  });

  test('Fetch and return authorization header if no token exists', async () => {
    const store: DrupalState = new DrupalState(dsConfig);
    fetchMock.mock(
      {
        url: 'https://demo-decoupled-bridge.lndo.site/oauth/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
      {
        status: 200,
        body: response,
      }
    );
    expect(await store['getAuthHeader']()).toEqual(
      `${response.token_type} ${response.access_token}`
    );
    expect(fetchMock).toBeCalledTimes(1);
  });

  test('Re-use token if valid', async () => {
    const store: DrupalState = new DrupalState(dsConfig);
    fetchMock.mock(
      {
        url: 'https://demo-decoupled-bridge.lndo.site/oauth/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
      {
        status: 200,
        body: response,
      }
    );
    expect(await store['getAuthHeader']()).toEqual(
      `${response.token_type} ${response.access_token}`
    );
    expect(await store['getAuthHeader']()).toEqual(
      `${response.token_type} ${response.access_token}`
    );
    expect(fetchMock).toBeCalledTimes(1);
  });

  test('Fetch a new token if expired', async () => {
    const store: DrupalState = new DrupalState(dsConfig);
    fetchMock.mock(
      {
        url: 'https://demo-decoupled-bridge.lndo.site/oauth/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
      {
        status: 200,
        body: responseExpired,
      }
    );
    expect(await store['getAuthHeader']()).toEqual(
      `${responseExpired.token_type} ${responseExpired.access_token}`
    );
    fetchMock.mock(
      {
        url: 'https://demo-decoupled-bridge.lndo.site/oauth/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
      {
        status: 200,
        body: response,
      }
    );
    expect(await store['getAuthHeader']()).toEqual(
      `${response.token_type} ${response.access_token}`
    );
    expect(fetchMock).toBeCalledTimes(2);
  });
});
