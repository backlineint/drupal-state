jest.mock('isomorphic-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('isomorphic-fetch');

import drupalState from '../drupalState';

import recipes from '../fetch/__tests__/data/collection.json';
import recipesResourcesState1 from './data/recipesResourcesState1.json';
import indexResponse from '../fetch/__tests__/data/apiIndex.json';

describe('drupalState', () => {
  beforeEach(() => {
    fetchMock.mockClear();
  });

  // Resource related tests:
  // If requested resource is in the collection store, return that
  // Resource isn't in state, so fetch it from Drupal
  // Creating new resource state
  // Updating existing resource state
  // Debug mode

  test('Api root is set by constructor', async () => {
    const store: drupalState = new drupalState({
      apiRoot: 'https://live-contentacms.pantheonsite.io/api',
    });
    expect(store.apiRoot).toEqual(
      'https://live-contentacms.pantheonsite.io/api'
    );
  });

  test('Get resource object from local resource state if it exists', async () => {
    const store: drupalState = new drupalState({
      apiRoot: 'https://live-contentacms.pantheonsite.io/api',
    });
    store.setState({ recipesResources: recipesResourcesState1 });
    expect(
      await store.getObject('recipes', 'a542e833-edfe-44a3-a6f1-7358b115af4b')
    ).toEqual(recipesResourcesState1['a542e833-edfe-44a3-a6f1-7358b115af4b']);
    expect(fetchMock).toBeCalledTimes(0);
  });

  test('Get collection object from local state if it exists', async () => {
    const store: drupalState = new drupalState({
      apiRoot: 'https://live-contentacms.pantheonsite.io/api',
    });
    store.setState({ recipes: recipes });
    expect(await store.getObject('recipes')).toEqual(recipes.data);
    expect(fetchMock).toBeCalledTimes(0);
  });

  test('Fetch API index and object if they do not exist in local storage', async () => {
    const store: drupalState = new drupalState({
      apiRoot: 'https://live-contentacms.pantheonsite.io/api',
    });
    fetchMock.mock('https://live-contentacms.pantheonsite.io/api', {
      status: 200,
      body: indexResponse,
    });
    fetchMock.mock('https://live-contentacms.pantheonsite.io/api/recipes', {
      status: 200,
      body: recipes,
    });
    expect(await store.getObject('recipes')).toEqual(recipes.data);
    expect(fetchMock).toBeCalledTimes(2);
  });

  test('Get API Index from local state if it exists', async () => {
    const store: drupalState = new drupalState({
      apiRoot: 'https://live-contentacms.pantheonsite.io/api',
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
    expect(await store.getObject('recipes')).toEqual(recipes.data);
    expect(fetchMock).toBeCalledTimes(1);
  });
});
