import DrupalState from '../DrupalState';

describe('assembleApiRoot', () => {
  test('Base and prefix results in valid apiRoot', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
    });
    expect(store.assembleApiRoot()).toEqual(
      'https://dev-ds-demo.pantheonsite.io/jsonapi/'
    );
  });
  test('apiPrefix defaults to jsonapi', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io/',
    });
    expect(store.assembleApiRoot()).toEqual(
      'https://dev-ds-demo.pantheonsite.io/jsonapi/'
    );
  });
  test('Extra trailing slash removed from apiBase', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io/',
      apiPrefix: 'jsonapi',
    });
    expect(store.assembleApiRoot()).toEqual(
      'https://dev-ds-demo.pantheonsite.io/jsonapi/'
    );
  });
  test('Leading slash removed from apiPrefix', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: '/jsonapi',
    });
    expect(store.assembleApiRoot()).toEqual(
      'https://dev-ds-demo.pantheonsite.io/jsonapi/'
    );
  });
  test('Trailing slash removed from apiPrefix', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi/',
    });
    expect(store.assembleApiRoot()).toEqual(
      'https://dev-ds-demo.pantheonsite.io/jsonapi/'
    );
  });
  test('Kitchen Sink', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io/',
      apiPrefix: 'jsonapi',
      defaultLocale: 'en',
    });
    expect(store.assembleApiRoot()).toEqual(
      'https://dev-ds-demo.pantheonsite.io/en/jsonapi/'
    );
  });
});
