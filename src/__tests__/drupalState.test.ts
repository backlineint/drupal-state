jest.mock('isomorphic-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('isomorphic-fetch');
// After adding recent dependencies, tests fail if global Headers are not defined.
global.Headers = fetchMock.Headers;

import DrupalState from '../DrupalState';

import recipes from '../fetch/__tests__/data/collection.json';
import recipesCollectionObject1 from './data/recipesCollectionObject1.json';
import recipesResourcesState1 from './data/recipesResourcesState1.json';
import recipesResourceObject1 from './data/recipesResourceObject1.json';
import recipesResourcesState2 from './data/recipesResourcesState2.json';
import recipesResourceData1 from './data/recipesResourceData1.json';
import recipesResourceData2 from './data/recipesResourceData2.json';
import recipesResourceObject2 from './data/recipesResourceObject2.json';
import indexResponse from '../fetch/__tests__/data/apiIndex.json';
import spanishApiIndex from './data/spanishApiIndex.json';
import tokenResponse from '../fetch/__tests__/data/token.json';
import nodePageSpanishResourceQueryData from './data/nodePageSpanishResourceQueryData.json';
import nodePageSpanishResourceQueryObject from './data/nodePageSpanishResourceQueryObject.json';

describe('drupalState', () => {
  beforeEach(() => {
    fetchMock.mockClear();
  });

  test('Constructor sets properties accordingly', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
    });
    expect(store.apiBase).toEqual('https://live-contentacms.pantheonsite.io');
    expect(store.apiPrefix).toEqual('jsonapi/');
    expect(store.apiRoot).toEqual(
      'https://live-contentacms.pantheonsite.io/jsonapi/'
    );
    expect(store['clientId']).toEqual('test-client-id');
    expect(store['clientSecret']).toEqual('test-client-secret');
    expect(store.auth).toEqual(true);
    expect(store['token']).toEqual({
      accessToken: '',
      validUntil: 0,
      tokenType: '',
    });
    expect(store.debug).toEqual(false);
  });

  test('Get resource object from local resource state if it exists', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
      debug: true,
    });
    expect(store.auth).toEqual(false);
    store.setState({ recipesResources: recipesResourcesState1 });
    expect(
      await store.getObject({
        objectName: 'recipes',
        id: 'a542e833-edfe-44a3-a6f1-7358b115af4b',
      })
    ).toEqual(recipesResourceObject1);
    expect(fetchMock).toBeCalledTimes(0);
  });

  test('Get resource object from local collection state if it exists', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
      debug: true,
    });
    store.setState({ recipes: recipes });
    expect(
      await store.getObject({
        objectName: 'recipes',
        id: 'a542e833-edfe-44a3-a6f1-7358b115af4b',
      })
    ).toEqual(recipesResourceObject1);
    expect(fetchMock).toBeCalledTimes(0);
  });

  test('Fetch resource if it does not exist in state', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
      debug: true,
    });
    store.setState({ dsApiIndex: indexResponse.links });
    fetchMock.mock(
      'https://live-contentacms.pantheonsite.io/api/recipes/a542e833-edfe-44a3-a6f1-7358b115af4b',
      {
        status: 200,
        body: recipesResourceData1,
      }
    );
    expect(
      await store.getObject({
        objectName: 'recipes',
        id: 'a542e833-edfe-44a3-a6f1-7358b115af4b',
      })
    ).toEqual(recipesResourceObject1);
    expect(fetchMock).toBeCalledTimes(1);
  });

  test('Add resource object to local resource state if resource state already exists', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
      debug: true,
    });
    store.setState({ dsApiIndex: indexResponse.links });
    store.setState({ recipesResources: recipesResourcesState1 });
    fetchMock.mock(
      'https://live-contentacms.pantheonsite.io/api/recipes/84cfaa18-faca-471f-bfa5-fbb8c199d039',
      {
        status: 200,
        body: recipesResourceData2,
      }
    );

    expect(
      await store.getObject({
        objectName: 'recipes',
        id: '84cfaa18-faca-471f-bfa5-fbb8c199d039',
      })
    ).toEqual(recipesResourceObject2);
    const state: any = await store.getState();
    expect(state.recipesResources).toEqual(recipesResourcesState2);
    expect(fetchMock).toBeCalledTimes(1);
  });

  test('Get collection object from local state if it exists', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
      debug: true,
    });
    store.setState({ recipes: recipes });
    expect(await store.getObject({ objectName: 'recipes' })).toEqual(
      recipesCollectionObject1
    );
    expect(fetchMock).toBeCalledTimes(0);
  });

  test('Fetch API index and object if they do not exist in local storage', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
      debug: true,
    });
    fetchMock.mock('https://live-contentacms.pantheonsite.io/api/', {
      status: 200,
      body: indexResponse,
    });
    fetchMock.mock('https://live-contentacms.pantheonsite.io/api/recipes', {
      status: 200,
      body: recipes,
    });
    expect(await store.getObject({ objectName: 'recipes' })).toEqual(
      recipesCollectionObject1
    );
    expect(fetchMock).toBeCalledTimes(2);
  });

  test('Get API Index from local state if it exists', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
    });
    store.setState({ dsApiIndex: indexResponse.links });
    fetchMock.mock(
      'https://live-contentacms.pantheonsite.io/api/recipes',
      {
        status: 200,
        body: recipes,
      },
      { overwriteRoutes: true }
    );
    expect(await store.getObject({ objectName: 'recipes' })).toEqual(
      recipesCollectionObject1
    );
    expect(fetchMock).toBeCalledTimes(1);
  });

  test('Fetch resource with authentication', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
      clientId: '9adc9c69-fa3b-4c21-9cef-fbd345d1a269',
      clientSecret: 'mysecret',
      debug: true,
    });
    store.setState({ dsApiIndex: indexResponse.links });
    fetchMock.mock(
      'https://live-contentacms.pantheonsite.io/api/recipes/a542e833-edfe-44a3-a6f1-7358b115af4b',
      {
        status: 200,
        body: recipesResourceData1,
      },
      { overwriteRoutes: true }
    );
    fetchMock.mock(
      {
        url: 'https://live-contentacms.pantheonsite.io/oauth/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
      {
        status: 200,
        body: tokenResponse,
      }
    );
    expect(await store['getAuthHeader']()).toEqual(
      `${tokenResponse.token_type} ${tokenResponse.access_token}`
    );
    expect(
      await store.getObject({
        objectName: 'recipes',
        id: 'a542e833-edfe-44a3-a6f1-7358b115af4b',
      })
    ).toEqual(recipesResourceObject1);
    expect(fetchMock).toBeCalledTimes(2);
  });

  test('A locale is honored if specified', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://demo-decoupled-bridge.lndo.site',
      apiPrefix: 'jsonapi',
      defaultLocale: 'es',
      debug: true,
    });
    store.setState({ dsApiIndex: spanishApiIndex });
    fetchMock.mock(
      'https://demo-decoupled-bridge.lndo.site/es/jsonapi/node/page/04fe66ed-1161-47f4-8a3f-6450eb9a8fa9?fields%5Bnode--page%5D=title%2Cid',
      {
        status: 200,
        body: nodePageSpanishResourceQueryData,
      }
    );
    expect(
      await store.getObject({
        objectName: 'node--page',
        id: '04fe66ed-1161-47f4-8a3f-6450eb9a8fa9',
        query: `{
          title
          id
        }`,
      })
    ).toEqual(nodePageSpanishResourceQueryObject);
    expect(fetchMock).toBeCalledTimes(1);
  });

  test("Locale not provided it won't be used as part of URL structure", async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
      debug: true,
    });
    store.setState({ dsApiIndex: indexResponse.links });
    expect(store.assembleApiRoot()).toEqual(
      'https://live-contentacms.pantheonsite.io/api/'
    );
  });
});
