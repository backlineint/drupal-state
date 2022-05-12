jest.mock('isomorphic-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('isomorphic-fetch');
// After adding recent dependencies, tests fail if global Headers are not defined.
global.Headers = fetchMock.Headers;

import { ServerResponse } from 'http';
import fetch from 'isomorphic-fetch';

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
import multiPageFetch1 from './data/multiPageFetch1.json';
import multiPageFetch2 from './data/multiPageFetch2.json';
import multiPageFetch3 from './data/multiPageFetch3.json';
import multiPageFetch4 from './data/multiPageFetch4.json';
import multiPageFetchResults from './data/multiPageFetchResults.json';

const testCustomFetch = (
  apiUrl: RequestInfo,
  requestInit = {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _res?: ServerResponse | boolean
): Promise<Response> => {
  console.log('Custom fetch function used');
  return fetch(apiUrl, requestInit);
};

const mockCustomOnError = jest.fn((err: Error) => {
  console.log('There was an error!');
  console.error(err.message);
});

describe('drupalState', () => {
  beforeEach(() => {
    fetchMock.mockClear();
  });

  test('Constructor sets properties accordingly', async () => {
    const customErrorHandler = (err: Error) => {
      throw err;
    };
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      onError: customErrorHandler,
    });
    expect(store.apiBase).toEqual('https://dev-ds-demo.pantheonsite.io');
    expect(store.apiPrefix).toEqual('jsonapi/');
    expect(store.apiRoot).toEqual(
      'https://dev-ds-demo.pantheonsite.io/jsonapi/'
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
    expect(store['onError']).toEqual(customErrorHandler);
  });
  test('Get resource object from local resource state if it exists', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
      debug: true,
    });
    expect(store.auth).toEqual(false);
    store.setState({ 'node--recipeResources': recipesResourcesState1 });

    expect(
      await store.getObject({
        objectName: 'node--recipe',
        id: '33386d32-a87c-44b9-b66b-3dd0bfc38dca',
      })
    ).toEqual(recipesResourceObject1);
    expect(fetchMock).toBeCalledTimes(0);
  });

  test('Get resource object from local collection state if it exists', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
      debug: true,
    });
    store.setState({ 'node--recipe': recipes });
    expect(
      await store.getObject({
        objectName: 'node--recipe',
        id: '33386d32-a87c-44b9-b66b-3dd0bfc38dca',
      })
    ).toEqual(recipesResourceObject1);
    expect(fetchMock).toBeCalledTimes(0);
  });

  test('Fetch resource if it does not exist in state', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
      debug: true,
    });
    store.setState({ dsApiIndex: indexResponse.links });
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/recipe/33386d32-a87c-44b9-b66b-3dd0bfc38dca',
      {
        status: 200,
        body: recipesResourceData1,
      }
    );
    expect(
      await store.getObject({
        objectName: 'node--recipe',
        id: '33386d32-a87c-44b9-b66b-3dd0bfc38dca',
      })
    ).toEqual(recipesResourceObject1);
    expect(fetchMock).toBeCalledTimes(1);
  });

  test('Add resource object to local resource state if resource state already exists', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
      debug: true,
    });
    store.setState({ dsApiIndex: indexResponse.links });
    store.setState({ 'node--recipeResources': recipesResourcesState1 });
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/recipe/50c3e7c9-64a9-453c-9289-278132beb4a2',
      {
        status: 200,
        body: recipesResourceData2,
      }
    );
    expect(
      await store.getObject({
        objectName: 'node--recipe',
        id: '50c3e7c9-64a9-453c-9289-278132beb4a2',
      })
    ).toEqual(recipesResourceObject2);
    const state: any = await store.getState();
    expect(state['node--recipeResources']).toEqual(recipesResourcesState2);
    expect(fetchMock).toBeCalledTimes(1);
  });

  test('Get collection object from local state if it exists', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
      debug: true,
    });
    store.setState({ 'node--recipe': recipes });
    expect(await store.getObject({ objectName: 'node--recipe' })).toEqual(
      recipesCollectionObject1
    );
    expect(fetchMock).toBeCalledTimes(0);
  });

  test('Fetch all Objects of a specific type', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io/',
      apiPrefix: 'jsonapi',
      debug: true,
    });
    store.setState({ dsApiIndex: indexResponse.links });
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/ds_example',
      {
        status: 200,
        body: multiPageFetch1,
      }
    );
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/ds_example?page%5Boffset%5D=50&page%5Blimit%5D=50',
      {
        status: 200,
        body: multiPageFetch2,
      }
    );
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/ds_example?page%5Boffset%5D=100&page%5Blimit%5D=50',
      {
        status: 200,
        body: multiPageFetch3,
      }
    );
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/ds_example?page%5Boffset%5D=150&page%5Blimit%5D=50',
      {
        status: 200,
        body: multiPageFetch4,
      }
    );

    expect(
      await store.getObject({
        objectName: 'node--ds_example',
        all: true,
      })
    ).toStrictEqual(multiPageFetchResults);
    expect(fetchMock).toBeCalledTimes(4);
  });

  test('Fetch API index and object if they do not exist in local storage', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
      debug: true,
    });
    fetchMock.mock('https://dev-ds-demo.pantheonsite.io/jsonapi/', {
      status: 200,
      body: indexResponse,
    });
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/recipe',
      {
        status: 200,
        body: recipes,
      }
    );
    expect(await store.getObject({ objectName: 'node--recipe' })).toEqual(
      recipesCollectionObject1
    );
    expect(fetchMock).toBeCalledTimes(2);
  });

  test('Get API Index from local state if it exists', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
    });
    store.setState({ dsApiIndex: indexResponse.links });
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/recipe',
      {
        status: 200,
        body: recipes,
      },
      { overwriteRoutes: true }
    );
    expect(await store.getObject({ objectName: 'node--recipe' })).toEqual(
      recipesCollectionObject1
    );
    expect(fetchMock).toBeCalledTimes(1);
  });

  test('Fetch resource with authentication', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
      clientId: '9adc9c69-fa3b-4c21-9cef-fbd345d1a269',
      clientSecret: 'mysecret',
      debug: true,
    });
    store.setState({ dsApiIndex: indexResponse.links });
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/recipe/33386d32-a87c-44b9-b66b-3dd0bfc38dca',
      {
        status: 200,
        body: recipesResourceData1,
      },
      { overwriteRoutes: true }
    );
    fetchMock.mock(
      {
        url: 'https://dev-ds-demo.pantheonsite.io/oauth/token',
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
        objectName: 'node--recipe',
        id: '33386d32-a87c-44b9-b66b-3dd0bfc38dca',
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
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
      debug: true,
    });
    store.setState({ dsApiIndex: indexResponse.links });
    expect(store.assembleApiRoot()).toEqual(
      'https://dev-ds-demo.pantheonsite.io/jsonapi/'
    );
  });

  test('Fetch resource with custom fetchAdapter', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
      fetchAdapter: testCustomFetch,
      debug: true,
    });
    store.setState({ dsApiIndex: indexResponse.links });
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe/33386d32-a87c-44b9-b66b-3dd0bfc38dca',
      {
        status: 200,
        body: recipesResourceData1,
      },
      { overwriteRoutes: true }
    );
    expect(
      await store.getObject({
        objectName: 'node--recipe',
        id: '33386d32-a87c-44b9-b66b-3dd0bfc38dca',
      })
    ).toEqual(recipesResourceObject1);
    expect(fetchMock).toBeCalledTimes(1);
  });
  test('Custom onError handler should be called if an error is thrown', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
      fetchAdapter: testCustomFetch,
      debug: true,
      onError: mockCustomOnError,
    });
    store.setState({ dsApiIndex: indexResponse.links });
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recpe',
      {
        status: 404,
        body: {},
      },
      { overwriteRoutes: true }
    );
    const result = await store.getObject({
      objectName: 'node--recie',
    });
    try {
      expect(result).toThrowError();
      expect(result).toEqual(undefined);
    } catch (error) {
      expect(mockCustomOnError).toBeCalledTimes(1);
    }
  });
});
