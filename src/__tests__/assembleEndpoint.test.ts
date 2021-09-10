import DrupalState from '../DrupalState';

describe('Correctly assemble endpoints including query params', () => {
  test('No parameters', async () => {
    const store: DrupalState = new DrupalState({
      apiRoot: 'https://live-contentacms.pantheonsite.io/api',
    });
    expect(
      store.assembleEndpoint(
        'https://live-contentacms.pantheonsite.io/api/recipes',
        ''
      )
    ).toEqual('https://live-contentacms.pantheonsite.io/api/recipes');
    expect(
      store.assembleEndpoint(
        { href: 'https://live-contentacms.pantheonsite.io/api/recipes' },
        ''
      )
    ).toEqual('https://live-contentacms.pantheonsite.io/api/recipes');
  });

  test('No parameters with ID', async () => {
    const store: DrupalState = new DrupalState({
      apiRoot: 'https://live-contentacms.pantheonsite.io/api',
    });
    expect(
      store.assembleEndpoint(
        'https://live-contentacms.pantheonsite.io/api/recipes',
        '',
        'a542e833-edfe-44a3-a6f1-7358b115af4b'
      )
    ).toEqual(
      'https://live-contentacms.pantheonsite.io/api/recipes/a542e833-edfe-44a3-a6f1-7358b115af4b'
    );
    expect(
      store.assembleEndpoint(
        { href: 'https://live-contentacms.pantheonsite.io/api/recipes' },
        '',
        'a542e833-edfe-44a3-a6f1-7358b115af4b'
      )
    ).toEqual(
      'https://live-contentacms.pantheonsite.io/api/recipes/a542e833-edfe-44a3-a6f1-7358b115af4b'
    );
  });

  test('Parameters, ID and includes', async () => {
    const store: DrupalState = new DrupalState({
      apiRoot: 'https://live-contentacms.pantheonsite.io/api',
    });
    store.params.addInclude(['image']);
    expect(
      store.assembleEndpoint(
        'https://live-contentacms.pantheonsite.io/api/recipes',
        store.params.getQueryString(),
        'a542e833-edfe-44a3-a6f1-7358b115af4b'
      )
    ).toEqual(
      'https://live-contentacms.pantheonsite.io/api/recipes/a542e833-edfe-44a3-a6f1-7358b115af4b?include=image'
    );
    expect(
      store.assembleEndpoint(
        { href: 'https://live-contentacms.pantheonsite.io/api/recipes' },
        store.params.getQueryString(),
        'a542e833-edfe-44a3-a6f1-7358b115af4b'
      )
    ).toEqual(
      'https://live-contentacms.pantheonsite.io/api/recipes/a542e833-edfe-44a3-a6f1-7358b115af4b?include=image'
    );
  });

  test('Parameters and includes, no ID', async () => {
    const store: DrupalState = new DrupalState({
      apiRoot: 'https://live-contentacms.pantheonsite.io/api',
    });
    store.params.addInclude(['image']);
    expect(
      store.assembleEndpoint(
        'https://live-contentacms.pantheonsite.io/api/recipes',
        store.params.getQueryString()
      )
    ).toEqual(
      'https://live-contentacms.pantheonsite.io/api/recipes?include=image'
    );
    expect(
      store.assembleEndpoint(
        { href: 'https://live-contentacms.pantheonsite.io/api/recipes' },
        store.params.getQueryString()
      )
    ).toEqual(
      'https://live-contentacms.pantheonsite.io/api/recipes?include=image'
    );
  });
});
