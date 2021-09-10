jest.mock('isomorphic-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('isomorphic-fetch');

import DrupalState from '../DrupalState';

import indexResponse from '../fetch/__tests__/data/apiIndex.json';
import hrefApiIndex from './data/hrefApiIndex.json';
import singleIncludeData from './data/singleIncludeData.json';
import singleIncludeObject from './data/singleIncludeObject.json';
import nestedIncludeData from './data/nestedIncludeData.json';
import nestedIncludeObject from './data/nestedIncludeObject.json';

describe('Test the use of JSON:API query parameters with DrupalState', () => {
  beforeEach(() => {
    fetchMock.mockClear();
  });

  test('Add a single include parameter', async () => {
    const store: DrupalState = new DrupalState({
      apiRoot: 'https://live-contentacms.pantheonsite.io/api',
    });
    store.params.addInclude(['image']);
    expect(store.params.getQueryString()).toEqual('include=image');
  });

  test('Add multiple include parameters', async () => {
    const store: DrupalState = new DrupalState({
      apiRoot: 'https://live-contentacms.pantheonsite.io/api',
    });
    store.params.addInclude(['image', 'tags']);
    expect(store.params.getQueryString()).toEqual('include=image%2Ctags');
  });

  test('I can reset parameters', async () => {
    const store: DrupalState = new DrupalState({
      apiRoot: 'https://live-contentacms.pantheonsite.io/api',
    });

    store.params.addInclude(['image', 'tags']);
    store.params.clear();
    expect(store.params.getQueryString()).toEqual('');

    store.params.addInclude(['tags']);
    expect(store.params.getQueryString()).toEqual('include=tags');
  });

  test('Fetch a resource with a single include', async () => {
    const store: DrupalState = new DrupalState({
      apiRoot: 'https://live-contentacms.pantheonsite.io/api',
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
      await store.getObject('recipes', 'a542e833-edfe-44a3-a6f1-7358b115af4b')
    ).toEqual(singleIncludeObject);
    expect(fetchMock).toBeCalledTimes(1);
  });

  test('Fetch a collection with nested includes', async () => {
    const store: DrupalState = new DrupalState({
      apiRoot: 'http://demo-decoupled-bridge.lndo.site/en/jsonapi',
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
    expect(await store.getObject('node--article')).toEqual(nestedIncludeObject);
    expect(fetchMock).toBeCalledTimes(1);
  });

  // TODO - Cover additional query parameters
});
