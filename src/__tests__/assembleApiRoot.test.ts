import DrupalState from '../DrupalState';

describe('assembleApiRoot', () => {
  test('Base and prefix results in valid apiRoot', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
    });
    expect(store.assembleApiRoot()).toEqual(
      'https://live-contentacms.pantheonsite.io/api/'
    );
  });
  test('apiPrefix defaults to jsonapi', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io/',
    });
    expect(store.assembleApiRoot()).toEqual(
      'https://live-contentacms.pantheonsite.io/jsonapi/'
    );
  });
  test('Extra trailing slash removed from apiBase', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io/',
      apiPrefix: 'api',
    });
    expect(store.assembleApiRoot()).toEqual(
      'https://live-contentacms.pantheonsite.io/api/'
    );
  });
  test('Leading slash removed from apiPrefix', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: '/api',
    });
    expect(store.assembleApiRoot()).toEqual(
      'https://live-contentacms.pantheonsite.io/api/'
    );
  });
  test('Trailing slash removed from apiPrefix', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api/',
    });
    expect(store.assembleApiRoot()).toEqual(
      'https://live-contentacms.pantheonsite.io/api/'
    );
  });
  test('Kitchen Sink', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io/',
      apiPrefix: '/en/api/',
    });
    expect(store.assembleApiRoot()).toEqual(
      'https://live-contentacms.pantheonsite.io/en/api/'
    );
  });
});
