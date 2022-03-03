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
  //TODO: update tests with https://dev-ds-demo.pantheonsite.io apiBase
  test('Add a single include parameter', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io/',
      apiPrefix: 'jsonapi',
    });
    store.params.addInclude(['field_media_image']);
    expect(store.params.getQueryString()).toEqual('include=field_media_image');
  });

  test('Add multiple include parameters', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io/',
      apiPrefix: 'jsonapi',
    });
    store.params.addInclude(['field_media_image', 'field_tags']);
    expect(store.params.getQueryString()).toEqual(
      'include=field_media_image%2Cfield_tags'
    );
  });

  test('I can reset parameters', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io/',
      apiPrefix: 'jsonapi',
    });

    store.params.addInclude(['field_media_image', 'field_tags']);
    store.params.clear();
    expect(store.params.getQueryString()).toEqual('');

    store.params.addInclude(['field_tags']);
    expect(store.params.getQueryString()).toEqual('include=field_tags');
  });

  test('Fetch a resource with a single include', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io/',
      apiPrefix: 'jsonapi',
      debug: true,
    });
    store.setState({ dsApiIndex: indexResponse.links });
    store.params.addInclude(['field_media_image']);
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/recipe/50c3e7c9-64a9-453c-9289-278132beb4a2?include=field_media_image',
      {
        status: 200,
        body: singleIncludeData,
      }
    );
    expect(
      await store.getObject({
        objectName: 'node--recipe',
        id: '50c3e7c9-64a9-453c-9289-278132beb4a2',
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
      apiBase: 'https://dev-ds-demo.pantheonsite.io/',
      apiPrefix: 'jsonapi',
      defaultLocale: 'en',
    });
    store.setState({ dsApiIndex: indexResponse.links });
    fetchMock.mock(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/recipe/59895e1a-f6ca-4a88-9cac-488b85e48ef8?fields%5Bnode--recipe%5D=title%2Cfield_difficulty%2Cid',
      {
        status: 200,
        body: recipesResourceQueryData1,
      }
    );
    await store.getObject({
      objectName: 'node--recipe',
      id: '59895e1a-f6ca-4a88-9cac-488b85e48ef8',
      query: `{
        title
        field_difficulty
        id
      }`,
    });
    expect(fetchMock).toBeCalledTimes(1);
    expect(store.params.getQueryString()).toEqual(
      'fields%5Bnode--recipe%5D=title%2Cfield_difficulty%2Cid'
    );
  });

  // TODO - Cover additional query parameters - groups, pagination, sort, etc.
});
