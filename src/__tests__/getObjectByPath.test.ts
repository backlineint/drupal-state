jest.mock('isomorphic-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('isomorphic-fetch');
fetchMock.config.overwriteRoutes = true;
global.Headers = fetchMock.Headers;

import DrupalState from '../DrupalState';
import { DsState } from '../types/types';

import demoApiIndex from './data/demoApiIndex.json';
import translatePathResponse from '../fetch/__tests__/data/translatePathResponse.json';
import recipesResourceData from './data/recipesResourceData3.json';
import recipesResourceByPath from './data/recipesResourceByPath.json';
import recipesResourceQueryByPath from './data/recipesResourceQueryByPath.json';
import translatePathState1 from './data/translatePathState1.json';
import translatePathState2 from './data/translatePathState2.json';
import recipesResourceQueryData from './data/recipesResourceQueryData3.json';

const dsConfig = {
  apiBase: 'https://demo-decoupled-bridge.lndo.site',
  apiPrefix: 'en/jsonapi',
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
      'https://demo-decoupled-bridge.lndo.site/router/translate-path?path=/recipes/fiery-chili-sauce&_format=json',
      {
        status: 200,
        body: translatePathResponse,
      }
    );
    fetchMock.mock(
      'https://demo-decoupled-bridge.lndo.site/en/jsonapi/node/recipe/33f4a373-433e-447b-afc4-705776065639',
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

  test('getObjectByPath supports queries', async () => {
    const store: DrupalState = new DrupalState(dsConfig);
    store.setState({ dsApiIndex: demoApiIndex.links });
    store.setState({ dsPathTranslations: translatePathState1 });

    fetchMock.mock(
      'https://demo-decoupled-bridge.lndo.site/en/jsonapi/node/recipe/1d857bf9-163b-48b2-990b-cc5dd234c76d?fields%5Bnode--recipe%5D=title%2Cid',
      {
        status: 200,
        body: recipesResourceQueryData,
      }
    );
    expect(
      await store.getObjectByPath({
        objectName: 'node--recipe',
        path: '/recipes/victoria-sponge-cake',
        query: `{
          title
          id
        }`,
      })
    ).toEqual(recipesResourceQueryByPath);
    expect(fetchMock).toBeCalledTimes(1);
  });

  test('A second path can be added to dsPathTranslation state', async () => {
    const store: DrupalState = new DrupalState(dsConfig);
    store.setState({ dsApiIndex: demoApiIndex.links });
    store.setState({ dsPathTranslations: translatePathState1 });

    fetchMock.mock(
      'https://demo-decoupled-bridge.lndo.site/en/jsonapi/node/recipe/1d857bf9-163b-48b2-990b-cc5dd234c76d?fields%5Bnode--recipe%5D=title%2Cid',
      {
        status: 200,
        body: recipesResourceQueryData,
      }
    );
    expect(
      await store.getObjectByPath({
        objectName: 'node--recipe',
        path: '/recipes/victoria-sponge-cake',
        query: `{
          title
          id
        }`,
      })
    ).toEqual(recipesResourceQueryByPath);
    expect(fetchMock).toBeCalledTimes(1);

    store.params.clear();
    fetchMock.mock(
      'https://demo-decoupled-bridge.lndo.site/router/translate-path?path=/recipes/fiery-chili-sauce&_format=json',
      {
        status: 200,
        body: translatePathResponse,
      }
    );
    fetchMock.mock(
      'https://demo-decoupled-bridge.lndo.site/en/jsonapi/node/recipe/33f4a373-433e-447b-afc4-705776065639',
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
});
