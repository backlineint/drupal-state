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

describe('drupalState', () => {
  beforeEach(() => {
    fetchMock.mockClear();
  });

  test('Api root and debug is set by constructor', async () => {
    const store: DrupalState = new DrupalState({
      apiRoot: 'https://live-contentacms.pantheonsite.io/api/',
    });
    expect(store.apiRoot).toEqual(
      'https://live-contentacms.pantheonsite.io/api/'
    );
    expect(store.debug).toEqual(false);
  });

  test('Get resource object from local resource state if it exists', async () => {
    const store: DrupalState = new DrupalState({
      apiRoot: 'https://live-contentacms.pantheonsite.io/api/',
      debug: true,
    });
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
      apiRoot: 'https://live-contentacms.pantheonsite.io/api/',
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
      apiRoot: 'https://live-contentacms.pantheonsite.io/api/',
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
      apiRoot: 'https://live-contentacms.pantheonsite.io/api/',
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
      apiRoot: 'https://live-contentacms.pantheonsite.io/api/',
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
      apiRoot: 'https://live-contentacms.pantheonsite.io/api/',
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
      apiRoot: 'https://live-contentacms.pantheonsite.io/api/',
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
});
