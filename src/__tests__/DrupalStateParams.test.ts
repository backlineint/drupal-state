jest.mock('isomorphic-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('isomorphic-fetch');
global.Headers = fetchMock.Headers;

import DrupalState from '../DrupalState';

import indexResponse from '../fetch/__tests__/data/apiIndex.json';
import hrefApiIndex from './data/hrefApiIndex.json';
import singleIncludeData from './data/singleIncludeData.json';
import singleIncludeObject from './data/singleIncludeObject.json';
import nestedIncludeData from './data/nestedIncludeData.json';
import nestedIncludeObject from './data/nestedIncludeObject.json';
import recipesResourceQueryData1 from './data/recipesResourceQueryData1.json';

describe('Test the use of JSON:API query parameters with DrupalState', () => {
  beforeEach(() => {
    fetchMock.mockClear();
  });

  test('Add a single include parameter', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
    });
    store.params.addInclude(['image']);
    expect(store.params.getQueryString()).toEqual('include=image');
  });

  test('Add multiple include parameters', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
    });
    store.params.addInclude(['image', 'tags']);
    expect(store.params.getQueryString()).toEqual('include=image%2Ctags');
  });

  test('I can reset parameters', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
    });

    store.params.addInclude(['image', 'tags']);
    store.params.clear();
    expect(store.params.getQueryString()).toEqual('');

    store.params.addInclude(['tags']);
    expect(store.params.getQueryString()).toEqual('include=tags');
  });

  test('Fetch a resource with a single include', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
      debug: true,
    });
    store.setState({ dsApiIndex: indexResponse.links });
    store.params.addInclude(['image']);
    fetchMock.mock(
      'https://live-contentacms.pantheonsite.io/api/recipes/a542e833-edfe-44a3-a6f1-7358b115af4b?include=image',
      {
        status: 200,
        body: singleIncludeData,
      }
    );
    expect(
      await store.getObject({
        objectName: 'recipes',
        id: 'a542e833-edfe-44a3-a6f1-7358b115af4b',
      })
    ).toEqual(singleIncludeObject);
    expect(fetchMock).toBeCalledTimes(1);
  });

  test('Fetch a collection with nested includes', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'http://demo-decoupled-bridge.lndo.site',
      apiPrefix: 'jsonapi',
      defaultLocale: 'en',
      debug: true,
    });
    store.setState({ dsApiIndex: hrefApiIndex.links });
    store.params.addInclude(['field_media_image.field_media_image']);
    fetchMock.mock(
      'http://demo-decoupled-bridge.lndo.site/en/jsonapi/node/article?include=field_media_image.field_media_image',
      {
        status: 200,
        body: nestedIncludeData,
      }
    );
    expect(await store.getObject({ objectName: 'node--article' })).toEqual(
      nestedIncludeObject
    );
    expect(fetchMock).toBeCalledTimes(1);
  });

  test('Field params are added by a query', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
    });
    store.setState({ dsApiIndex: indexResponse.links });
    fetchMock.mock(
      'https://live-contentacms.pantheonsite.io/api/recipes/912e092f-a7d5-41ae-9e92-e23ffa357b28?fields%5Brecipes%5D=title%2Cdifficulty%2Cid',
      {
        status: 200,
        body: recipesResourceQueryData1,
      }
    );
    await store.getObject({
      objectName: 'recipes',
      id: '912e092f-a7d5-41ae-9e92-e23ffa357b28',
      query: `{
        title
        difficulty
        id
      }`,
    });
    expect(fetchMock).toBeCalledTimes(1);
    expect(store.params.getQueryString()).toEqual(
      'fields%5Brecipes%5D=title%2Cdifficulty%2Cid'
    );
  });

  // TODO - Cover additional query parameters - groups, pagination, sort, etc.
});
