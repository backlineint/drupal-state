jest.mock('isomorphic-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('isomorphic-fetch');
fetchMock.config.overwriteRoutes = true;
global.Headers = fetchMock.Headers;

import DrupalState from '../DrupalState';
import { DsState } from '../types/types';

import demoApiIndex from './data/demoApiIndex.json';
import translatePathResponse from '../fetch/__tests__/data/translatePathResponse.json';
import translatePathResponse2 from '../fetch/__tests__/data/translatePathResponse2.json';
import recipesResourceData from './data/recipesResourceData3.json';
import recipesResourceData4 from './data/recipesResourceData4.json';
import recipesResourceByPath from './data/recipesResourceByPath.json';
// import recipesResourceObjectByPath from './data/recipesResourceByPath.json';
// import recipesResourceObjectByPath2 from './data/recipesResourceByPath2.json';

import translatePathState1 from './data/translatePathState1.json';
import translatePathState2 from './data/translatePathState2.json';

const dsConfig = {
  apiBase: 'https://dev-ds-demo.pantheonsite.io',
  apiPrefix: 'jsonapi',
  defaultLocale: 'en',
  debug: true,
};

describe('getObjectByPath', () => {
  beforeEach(() => {
    fetchMock.mockClear();
  });

  test('Get an object by path fetching both translate-path and recipe', async () => {
    const store: DrupalState = new DrupalState(dsConfig);
    // Set the demo index in state so we don't have to fetch it - tests for this
    // are covered elsewhere.
    store.setState({ dsApiIndex: demoApiIndex.links });

    // getObjectByPath will now make two fetch requests, so we need to mock them.
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/router/translate-path?path=/recipes/fiery-chili-sauce&_format=json',
      {
        status: 200,
        body: translatePathResponse,
      }
    );
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/recipe/da1359f4-2e60-462c-8909-47c3bce11fdf',
      {
        status: 200,
        body: recipesResourceData,
      }
    );
    expect(
      await store.getObjectByPath({
        objectName: 'node--recipe',
        path: '/recipes/fiery-chili-sauce',
      })
    ).toEqual(recipesResourceByPath);
    // A second request for this object should use both the path translation and
    // object that are in local state, resulting with no additional fetch calls.
    expect(
      await store.getObjectByPath({
        objectName: 'node--recipe',
        path: '/recipes/fiery-chili-sauce',
      })
    ).toEqual(recipesResourceByPath);
    expect(fetchMock).toBeCalledTimes(2);
  });

  test('Re-fetch an object by path where translate-path and recipe are both in state but refresh is set to true', async () => {
    const store: DrupalState = new DrupalState(dsConfig);
    store.setState({ dsApiIndex: demoApiIndex.links });

    expect(
      await store.getObjectByPath({
        objectName: 'node--recipe',
        path: '/recipes/fiery-chili-sauce',
      })
    ).toEqual(recipesResourceByPath);
    expect(
      await store.getObjectByPath({
        objectName: 'node--recipe',
        path: '/recipes/fiery-chili-sauce',
        refresh: true,
      })
    ).toEqual(recipesResourceByPath);
    expect(fetchMock).toBeCalledTimes(4);
  });

  test('it should add a second path to dsPathTranslation state', async () => {
    const store: DrupalState = new DrupalState(dsConfig);
    store.setState({ dsApiIndex: demoApiIndex.links });
    store.setState({ dsPathTranslations: translatePathState1 });

    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/recipe/510cec29-bc95-4a64-a519-0ca6084529db',
      {
        status: 200,
        body: recipesResourceData4,
      }
    );
    expect(
      await store.getObjectByPath({
        objectName: 'node--recipe',
        path: '/recipes/victoria-sponge-cake',
      })
    ).toEqual(translatePathResponse2);
    expect(fetchMock).toBeCalledTimes(1);

    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/router/translate-path?path=/recipes/fiery-chili-sauce&_format=json',
      {
        status: 200,
        body: translatePathResponse,
      }
    );
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/recipe/da1359f4-2e60-462c-8909-47c3bce11fdf',
      {
        status: 200,
        body: recipesResourceData,
      }
    );
    expect(
      await store.getObjectByPath({
        objectName: 'node--recipe',
        path: '/recipes/fiery-chili-sauce',
      })
    ).toEqual(recipesResourceByPath);
    const currentState = store.getState() as DsState;
    expect(currentState.dsPathTranslations).toEqual(translatePathState2);
    expect(fetchMock).toBeCalledTimes(3);
  });
  test('An undefined response from translatePath should throw an error', async () => {
    const store: DrupalState = new DrupalState(dsConfig);
    // Replace the implementation here to avoid an unhandled rejection error
    // This is needed because of the way we are bubbling errors up to `onError`
    jest.spyOn(store, 'onError').mockImplementation((err: Error) => {
      console.error(err);
    });
    // Set the demo index in state so we don't have to fetch it - tests for this
    // are covered elsewhere.
    store.setState({ dsApiIndex: demoApiIndex.links });

    // getObjectByPath will now make two fetch requests, so we need to mock them.
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/router/translate-path?path=/recipes/fiery-chii-sauce&_format=json',
      {
        status: 404,
        body: {},
      }
    );
    store
      .getObjectByPath({
        objectName: 'node--recipe',
        // force error in path
        path: '/recipes/fiery-chii-sauce',
      })
      .catch(e => {
        expect(e).toEqual(`Error: Failed to fetch JSON:API endpoint.
        Tried fetching: https://dev-ds-demo.pantheonsite.io/router/translate-path?path=/recipes/fiery-chii-sauce&_format=json
        Server responded with status code: 404`);
      });
  });
  test('should fetch a resource anonymously when anon: true', async () => {
    const store: DrupalState = new DrupalState({
      ...dsConfig,
      clientId: '9adc9c69-fa3b-4c21-9cef-fbd345d1a269',
      clientSecret: 'mysecret',
    });
    const getAuthHeaderSpy = jest.spyOn(store, 'getAuthHeader');
    store.setState({ dsApiIndex: demoApiIndex.links });
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/router/translate-path?path=/recipes/fiery-chili-sauce&_format=json',
      {
        status: 200,
        body: translatePathResponse,
      }
    );
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/recipe/da1359f4-2e60-462c-8909-47c3bce11fdf',
      {
        status: 200,
        body: recipesResourceData,
      }
    );
    expect(
      await store.getObjectByPath({
        objectName: 'node--recipe',
        path: '/recipes/fiery-chili-sauce',
        anon: true,
      })
    ).toEqual(recipesResourceByPath);
    expect(getAuthHeaderSpy).toBeCalledTimes(0);
  });
  test('Fetch an object by path where noStore is set to true', async () => {
    const store: DrupalState = new DrupalState({
      ...dsConfig,
      noStore: true,
    });
    store.setState({ dsApiIndex: demoApiIndex.links });

    expect(
      await store.getObjectByPath({
        objectName: 'node--recipe',
        path: '/recipes/fiery-chili-sauce',
      })
    ).toEqual(recipesResourceByPath);
    expect(
      await store.getObjectByPath({
        objectName: 'node--recipe',
        path: '/recipes/fiery-chili-sauce',
      })
    ).toEqual(recipesResourceByPath);
    expect(fetchMock).toBeCalledTimes(4);
  });
});
