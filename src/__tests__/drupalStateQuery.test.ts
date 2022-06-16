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
import recipeResourceObject1WithParams from './data/recipesResourceObject1WithParams.json';
import recipesResourcesQueryState2 from './data/recipesResourcesQueryState2.json';
import recipesResourceQueryData1 from './data/recipesResourceQueryData1.json';
import recipesResourceQueryData1WithParams from './data/recipesResourceQueryData1WithParams.json';
import recipesResourceQueryData2 from './data/recipesResourceQueryData2.json';
import nodePageResourceQueryData from './data/nodePageResourceQueryData.json';
import recipesResourceQueryObject2 from './data/recipesResourceQueryObject2.json';
import nodePageResourceQueryObject from './data/nodePageResourceQueryObject.json';
import indexResponse from '../fetch/__tests__/data/apiIndex.json';
import hyphenatedApiIndex from './data/hyphenatedApiIndex.json';
import tokenResponse from '../fetch/__tests__/data/token.json';
import ds_exampleCollectionObjectQuery from './data/ds_exampleCollectionObjectQuery.json';
import ds_exampleQueryResponsePage1 from './data/ds_exampleQueryResponsePage1.json';
import ds_exampleQueryResponsePage2 from './data/ds_exampleQueryResponsePage2.json';
import ds_exampleQueryResponsePage3 from './data/ds_exampleQueryResponsePage3.json';
import ds_exampleQueryResponsePage4 from './data/ds_exampleQueryResponsePage4.json';
import ds_exampleCollectionObjects from './data/ds_exampleCollectionObjects.json';
import { ApolloError } from '@apollo/client';

describe('drupalState', () => {
  beforeEach(() => {
    fetchMock.mockClear();
  });

  test('Get resource object from local resource state if it exists', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
      debug: true,
    });
    store.setState({ 'node--recipeResources': recipesResourcesQueryState1 });
    expect(
      await store.getObject({
        objectName: 'node--recipe',
        id: '59895e1a-f6ca-4a88-9cac-488b85e48ef8',
        query: `{
          title
          field_difficulty
          id
        }`,
      })
    ).toEqual(recipesResourceQueryObject1);
    expect(fetchMock).toBeCalledTimes(0);
  });

  test('Fetch resource if it does not exist in state', async () => {
    debugger;
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
      defaultLocale: 'en',
      debug: true,
    });
    store.setState({ dsApiIndex: indexResponse.links });
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/recipe/59895e1a-f6ca-4a88-9cac-488b85e48ef8?fields%5Bnode--recipe%5D=title%2Cfield_difficulty%2Cid',
      {
        status: 200,
        body: recipesResourceQueryData1,
      },
      { overwriteRoutes: true }
    );
    expect(
      await store.getObject({
        objectName: 'node--recipe',
        id: '59895e1a-f6ca-4a88-9cac-488b85e48ef8',
        query: `{
          title
          field_difficulty
          id
        }`,
      })
    ).toEqual(recipesResourceQueryObject1);
    expect(fetchMock).toBeCalledTimes(1);
  });

  test('Fetch resource with params if it does not exist in state', async () => {
    debugger;
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
      defaultLocale: 'en',
      debug: true,
    });
    store.setState({ dsApiIndex: indexResponse.links });
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/recipe/21a95a3d-4a83-494f-b7b4-dcfb0f164a74?include=field_media_image.field_media_image&fields%5Bnode--recipe%5D=title%2Cfield_difficulty%2Cfield_media_image%2Cid',
      {
        status: 200,
        body: recipesResourceQueryData1WithParams,
      }
    );
    expect(
      await store.getObject({
        objectName: 'node--recipe',
        id: '21a95a3d-4a83-494f-b7b4-dcfb0f164a74',
        query: `{
          title
          field_difficulty
          field_media_image {
            field_media_image {
              uri {
                url
              }
            }
          }
          id
        }`,
        params: 'include=field_media_image.field_media_image',
      })
    ).toEqual(recipeResourceObject1WithParams);
    expect(fetchMock).toBeCalledTimes(1);
  });

  test('Fetch resource object even if it exists in local collection state', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
      defaultLocale: 'en',
      debug: true,
    });
    store.setState({
      dsApiIndex: indexResponse.links,
      'node--recipe': recipes,
    });
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/recipe/59895e1a-f6ca-4a88-9cac-488b85e48ef8?fields%5Bnode--recipe%5D=title%2Cfield_difficulty%2Cid',
      {
        status: 200,
        body: recipesResourceQueryData1,
      },
      { overwriteRoutes: true }
    );
    expect(
      await store.getObject({
        objectName: 'node--recipe',
        id: '59895e1a-f6ca-4a88-9cac-488b85e48ef8',
        query: `{
          title
          field_difficulty
          id
        }`,
      })
    ).toEqual(recipesResourceQueryObject1);
    expect(fetchMock).toBeCalledTimes(1);
  });

  test('Add resource object to local resource state if resource state already exists', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
      defaultLocale: 'en',
      debug: true,
    });
    store.setState({ dsApiIndex: indexResponse.links });
    store.setState({ 'node--recipeResources': recipesResourcesQueryState1 });
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/recipe/510cec29-bc95-4a64-a519-0ca6084529db?fields%5Bnode--recipe%5D=title%2Cfield_difficulty%2Cid',
      {
        status: 200,
        body: recipesResourceQueryData2,
      }
    );

    expect(
      await store.getObject({
        objectName: 'node--recipe',
        id: '510cec29-bc95-4a64-a519-0ca6084529db',
        query: `{
          title
          field_difficulty
          id
        }`,
      })
    ).toEqual(recipesResourceQueryObject2);
    const state: any = await store.getState();
    expect(state['node--recipeResources']).toEqual(recipesResourcesQueryState2);
    expect(fetchMock).toBeCalledTimes(1);
  });

  test('Get collection object from local state if it exists', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      debug: true,
    });
    store.setState({ 'taxonomy_term--recipe_category': categories });
    expect(
      await store.getObject({
        objectName: 'taxonomy_term--recipe_category',
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
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
      defaultLocale: 'en',
      debug: true,
    });
    store.setState({ dsApiIndex: indexResponse.links });
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/taxonomy_term/recipe_category?fields%5Btaxonomy_term--recipe_category%5D=name%2Cid',
      {
        status: 200,
        body: categoriesCollectionQueryResponse,
      }
    );
    expect(
      await store.getObject({
        objectName: 'taxonomy_term--recipe_category',
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
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
      clientId: '9adc9c69-fa3b-4c21-9cef-fbd345d1a269',
      clientSecret: 'mysecret',
      defaultLocale: 'en',
      debug: true,
    });
    store.setState({ dsApiIndex: indexResponse.links });
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/recipe/59895e1a-f6ca-4a88-9cac-488b85e48ef8?fields%5Bnode--recipe%5D=title%2Cfield_difficulty%2Cid',
      {
        status: 200,
        body: recipesResourceQueryData1,
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
        id: '59895e1a-f6ca-4a88-9cac-488b85e48ef8',
        query: `{
          title
          field_difficulty
          id
        }`,
      })
    ).toEqual(recipesResourceQueryObject1);
    expect(fetchMock).toBeCalledTimes(2);
  });

  test('Fetch all Objects of a specific type using a query', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      defaultLocale: 'en',
      apiPrefix: 'jsonapi',
      debug: true,
    });
    store.setState({ dsApiIndex: indexResponse.links });
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/ds_example?fields%5Bnode--ds_example%5D=title%2Cid',
      {
        status: 200,
        body: ds_exampleQueryResponsePage1,
      },
      { overwriteRoutes: true }
    );
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/ds_example?fields%5Bnode--ds_example%5D=title%2Cid&page%5Boffset%5D=50&page%5Blimit%5D=50',
      {
        status: 200,
        body: ds_exampleQueryResponsePage2,
      },
      { overwriteRoutes: true }
    );
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/ds_example?fields%5Bnode--ds_example%5D=title%2Cid&page%5Boffset%5D=100&page%5Blimit%5D=50',
      {
        status: 200,
        body: ds_exampleQueryResponsePage3,
      },
      { overwriteRoutes: true }
    );
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/ds_example?fields%5Bnode--ds_example%5D=title%2Cid&page%5Boffset%5D=150&page%5Blimit%5D=50',
      {
        status: 200,
        body: ds_exampleQueryResponsePage4,
      },
      { overwriteRoutes: true }
    );

    expect(
      await store.getObject({
        objectName: 'node--ds_example',
        all: true,
        query: `{
          title
          id
        }`,
      })
    ).toEqual(ds_exampleCollectionObjectQuery);
    expect(fetchMock).toBeCalledTimes(4);
  });

  test('Fetch all Objects of a specific type using a query when that object type is found in store', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
      defaultLocale: 'en',
      debug: true,
    });
    store.setState({
      'node--ds_example': ds_exampleCollectionObjects,
      dsApiIndex: indexResponse.links,
    });

    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/ds_example?fields%5Bnode--ds_example%5D=title%2Cid',
      {
        status: 200,
        body: ds_exampleQueryResponsePage1,
      },
      { overwriteRoutes: true }
    );
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/ds_example?fields%5Bnode--ds_example%5D=title%2Cid&page%5Boffset%5D=50&page%5Blimit%5D=50',
      {
        status: 200,
        body: ds_exampleQueryResponsePage2,
      },
      { overwriteRoutes: true }
    );
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/ds_example?fields%5Bnode--ds_example%5D=title%2Cid&page%5Boffset%5D=100&page%5Blimit%5D=50',
      {
        status: 200,
        body: ds_exampleQueryResponsePage3,
      },
      { overwriteRoutes: true }
    );
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/ds_example?fields%5Bnode--ds_example%5D=title%2Cid&page%5Boffset%5D=150&page%5Blimit%5D=50',
      {
        status: 200,
        body: ds_exampleQueryResponsePage4,
      },
      { overwriteRoutes: true }
    );

    expect(
      await store.getObject({
        objectName: 'node--ds_example',
        all: true,
        query: `{
          title
          id
        }`,
      })
    ).toEqual(ds_exampleCollectionObjectQuery);
    expect(fetchMock).toBeCalledTimes(4);
  });
  test('ApolloErrors are caught and thrown', async () => {
    const mockOnError = jest.fn((err: Error) => {
      throw err;
    });
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
      defaultLocale: 'en',
      debug: true,
      onError: mockOnError,
    });
    store.setState({ dsApiIndex: indexResponse.links });
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/recipe/59895e1a-f6ca-4a88-9cac-488b85e48ef8?fields%5Bnode--recipe%5D=title%2Cfield_difficulty%2Cid',
      {
        status: 200,
        throw: new ApolloError({}),
      },
      {
        overwriteRoutes: true,
      }
    );
    try {
      expect(
        await store.getObject({
          objectName: 'node--recipe',
          id: '59895e1a-f6ca-4a88-9cac-488b85e48ef8',
          query: `{
            title
            field_difficulty
            id
          }`,
        })
      ).toThrow();
    } catch (error) {
      expect(error instanceof ApolloError);
      expect(mockOnError).toBeCalledTimes(1);
    }
  });
});
