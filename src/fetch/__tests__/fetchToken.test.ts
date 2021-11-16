jest.mock('isomorphic-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('isomorphic-fetch');
fetchMock.config.overwriteRoutes = true;

import fetchToken from '../fetchToken';
import response from './data/token.json';

const tokenRequestBody = {
  grant_type: 'client_credentials',
  client_id: '9adc9c69-fa3b-4c21-9cef-fbd345d1a269',
  client_secret: 'mysecret',
};

describe('fetchToken', () => {
  test('A valid client_credentials request returns a token', async () => {
    fetchMock.mock(
      {
        url: 'https://demo-decoupled-bridge.lndo.site/oauth/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        // TODO - would also be ideal to match on body (grant_type / client_id)
        // here, but I'm not sure how to do that with fetch-mock-jest
      },
      {
        status: 200,
        body: response,
      }
    );
    expect(
      await fetchToken(
        'https://demo-decoupled-bridge.lndo.site/oauth/token',
        tokenRequestBody
      )
    ).toEqual(response);
  });
});
