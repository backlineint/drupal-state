jest.mock('isomorphic-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('isomorphic-fetch');
// After adding recent dependencies, tests fail if global Headers are not defined.
global.Headers = fetchMock.Headers;

import DrupalState from '../DrupalState';

import recipes from '../fetch/__tests__/data/collection.json';
import categories from './data/categoriesCollectionQuery.json';
import categoriesCollectionQueryResponse from './data/categoriesCollectionQueryResponse.json';
import categoriesCollectionObjectQuery from './data/categoriesCollectionObjectQuery.json';
import recipesResourcesQueryState1 from './data/recipesResourcesQueryState1.json';
import recipesResourceQueryObject1 from './data/recipesResourceQueryObject1.json';
import recipesResourcesQueryState2 from './data/recipesResourcesQueryState2.json';
import recipesResourceQueryData1 from './data/recipesResourceQueryData1.json';
import recipesResourceQueryData2 from './data/recipesResourceQueryData2.json';
import nodePageResourceQueryData from './data/nodePageResourceQueryData.json';
import recipesResourceQueryObject2 from './data/recipesResourceQueryObject2.json';
import nodePageResourceQueryObject from './data/nodePageResourceQueryObject.json';
import indexResponse from '../fetch/__tests__/data/apiIndex.json';
import hyphenatedApiIndex from './data/hyphenatedApiIndex.json';
import tokenResponse from '../fetch/__tests__/data/token.json';

describe('drupalState', () => {
  beforeEach(() => {
    fetchMock.mockClear();
  });

  test('Get resource object from local resource state if it exists', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
      debug: true,
    });
    store.setState({ recipesResources: recipesResourcesQueryState1 });
    expect(
      await store.getObject({
        objectName: 'recipes',
        id: '912e092f-a7d5-41ae-9e92-e23ffa357b28',
        query: `{
          title
          difficulty
          id
        }`,
      })
    ).toEqual(recipesResourceQueryObject1);
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
      'https://live-contentacms.pantheonsite.io/api/recipes/912e092f-a7d5-41ae-9e92-e23ffa357b28?fields%5Brecipes%5D=title%2Cdifficulty%2Cid',
      {
        status: 200,
        body: recipesResourceQueryData1,
      }
    );
    expect(
      await store.getObject({
        objectName: 'recipes',
        id: '912e092f-a7d5-41ae-9e92-e23ffa357b28',
        query: `{
          title
          difficulty
          id
        }`,
      })
    ).toEqual(recipesResourceQueryObject1);
    expect(fetchMock).toBeCalledTimes(1);
  });

  test('Fetch resource object even if it exists in local collection state', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
      debug: true,
    });
    store.setState({
      dsApiIndex: indexResponse.links,
      recipes: recipes,
    });
    fetchMock.mock(
      'https://live-contentacms.pantheonsite.io/api/recipes/912e092f-a7d5-41ae-9e92-e23ffa357b28?fields%5Brecipes%5D=title%2Cdifficulty%2Cid',
      {
        status: 200,
        body: recipesResourceQueryData1,
      },
      { overwriteRoutes: true }
    );
    expect(
      await store.getObject({
        objectName: 'recipes',
        id: '912e092f-a7d5-41ae-9e92-e23ffa357b28',
        query: `{
          title
          difficulty
          id
        }`,
      })
    ).toEqual(recipesResourceQueryObject1);
    expect(fetchMock).toBeCalledTimes(1);
  });

  test('Add resource object to local resource state if resource state already exists', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
      debug: true,
    });
    store.setState({ dsApiIndex: indexResponse.links });
    store.setState({ recipesResources: recipesResourcesQueryState1 });
    fetchMock.mock(
      'https://live-contentacms.pantheonsite.io/api/recipes/84cfaa18-faca-471f-bfa5-fbb8c199d039?fields%5Brecipes%5D=title%2Cdifficulty%2Cid',
      {
        status: 200,
        body: recipesResourceQueryData2,
      }
    );

    expect(
      await store.getObject({
        objectName: 'recipes',
        id: '84cfaa18-faca-471f-bfa5-fbb8c199d039',
        query: `{
          title
          difficulty
          id
        }`,
      })
    ).toEqual(recipesResourceQueryObject2);
    const state: any = await store.getState();
    expect(state.recipesResources).toEqual(recipesResourcesQueryState2);
    expect(fetchMock).toBeCalledTimes(1);
  });

  test('Get collection object from local state if it exists', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
      debug: true,
    });
    store.setState({ categories: categories });
    expect(
      await store.getObject({
        objectName: 'categories',
        query: `{
          name
          id
        }`,
      })
    ).toEqual(categoriesCollectionObjectQuery);
    expect(fetchMock).toBeCalledTimes(0);
  });

  test('Fetch resource object if they do not exist in local storage', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
      debug: true,
    });
    store.setState({ dsApiIndex: indexResponse.links });
    fetchMock.mock(
      'https://live-contentacms.pantheonsite.io/api/categories?fields%5Bcategories%5D=name%2Cid',
      {
        status: 200,
        body: categoriesCollectionQueryResponse,
      }
    );
    expect(
      await store.getObject({
        objectName: 'categories',
        query: `{
          name
          id
        }`,
      })
    ).toEqual(categoriesCollectionObjectQuery);
    expect(fetchMock).toBeCalledTimes(1);
  });

  test('Get resource object with hyphens in objectName', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'http://demo-decoupled-bridge.lndo.site',
      apiPrefix: 'jsonapi',
      defaultLocale: 'en',
      debug: true,
    });
    store.setState({ dsApiIndex: hyphenatedApiIndex });
    fetchMock.mock(
      'http://demo-decoupled-bridge.lndo.site/en/jsonapi/node/page/04fe66ed-1161-47f4-8a3f-6450eb9a8fa9?fields%5Bnode--page%5D=id%2Ctitle%2Cbody%2Cpath',
      {
        status: 200,
        body: nodePageResourceQueryData,
      }
    );
    expect(
      await store.getObject({
        objectName: 'node--page',
        id: '04fe66ed-1161-47f4-8a3f-6450eb9a8fa9',
        query: `{
          id
          title
          body
          path {
            alias
          }
        }`,
      })
    ).toEqual(nodePageResourceQueryObject);
    expect(fetchMock).toBeCalledTimes(1);
  });

  test('Fetch resource using query and authentication', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
      clientId: '9adc9c69-fa3b-4c21-9cef-fbd345d1a269',
      clientSecret: 'mysecret',
      debug: true,
    });
    store.setState({ dsApiIndex: indexResponse.links });
    fetchMock.mock(
      'https://live-contentacms.pantheonsite.io/api/recipes/912e092f-a7d5-41ae-9e92-e23ffa357b28?fields%5Brecipes%5D=title%2Cdifficulty%2Cid',
      {
        status: 200,
        body: recipesResourceQueryData1,
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
        id: '912e092f-a7d5-41ae-9e92-e23ffa357b28',
        query: `{
          title
          difficulty
          id
        }`,
      })
    ).toEqual(recipesResourceQueryObject1);
    expect(fetchMock).toBeCalledTimes(2);
  });
});
