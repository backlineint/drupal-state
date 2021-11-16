import DrupalState from '../DrupalState';

describe('Correctly assemble endpoints including query params', () => {
  test('No parameters', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
    });
    expect(
      store.assembleEndpoint(
        'recipes',
        'https://live-contentacms.pantheonsite.io/api/recipes'
      )
    ).toEqual('https://live-contentacms.pantheonsite.io/api/recipes');
    expect(
      store.assembleEndpoint('recipes', {
        href: 'https://live-contentacms.pantheonsite.io/api/recipes',
      })
    ).toEqual('https://live-contentacms.pantheonsite.io/api/recipes');
  });

  test('No parameters with ID', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
    });
    expect(
      store.assembleEndpoint(
        'recipes',
        'https://live-contentacms.pantheonsite.io/api/recipes',
        'a542e833-edfe-44a3-a6f1-7358b115af4b'
      )
    ).toEqual(
      'https://live-contentacms.pantheonsite.io/api/recipes/a542e833-edfe-44a3-a6f1-7358b115af4b'
    );
    expect(
      store.assembleEndpoint(
        'recipes',
        { href: 'https://live-contentacms.pantheonsite.io/api/recipes' },
        'a542e833-edfe-44a3-a6f1-7358b115af4b'
      )
    ).toEqual(
      'https://live-contentacms.pantheonsite.io/api/recipes/a542e833-edfe-44a3-a6f1-7358b115af4b'
    );
  });

  test('Parameters, ID and includes', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
    });
    store.params.addInclude(['image']);
    expect(
      store.assembleEndpoint(
        'recipes',
        'https://live-contentacms.pantheonsite.io/api/recipes',
        'a542e833-edfe-44a3-a6f1-7358b115af4b'
      )
    ).toEqual(
      'https://live-contentacms.pantheonsite.io/api/recipes/a542e833-edfe-44a3-a6f1-7358b115af4b?include=image'
    );
    expect(
      store.assembleEndpoint(
        'recipes',
        { href: 'https://live-contentacms.pantheonsite.io/api/recipes' },
        'a542e833-edfe-44a3-a6f1-7358b115af4b'
      )
    ).toEqual(
      'https://live-contentacms.pantheonsite.io/api/recipes/a542e833-edfe-44a3-a6f1-7358b115af4b?include=image'
    );
  });

  test('Parameters and includes, no ID', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
    });
    store.params.addInclude(['image']);
    expect(
      store.assembleEndpoint(
        'recipes',
        'https://live-contentacms.pantheonsite.io/api/recipes'
      )
    ).toEqual(
      'https://live-contentacms.pantheonsite.io/api/recipes?include=image'
    );
    expect(
      store.assembleEndpoint('recipes', {
        href: 'https://live-contentacms.pantheonsite.io/api/recipes',
      })
    ).toEqual(
      'https://live-contentacms.pantheonsite.io/api/recipes?include=image'
    );
  });

  test('Query', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
    });
    expect(
      store.assembleEndpoint(
        'recipes',
        'https://live-contentacms.pantheonsite.io/api/recipes',
        '',
        `{
          title
          difficulty
          id
        }`
      )
    ).toEqual('recipes?fields%5Brecipes%5D=title%2Cdifficulty%2Cid');
  });

  test('Query with ID', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
    });
    expect(
      store.assembleEndpoint(
        'recipes',
        'https://live-contentacms.pantheonsite.io/api/recipes',
        'a542e833-edfe-44a3-a6f1-7358b115af4b',
        `{
          title
          difficulty
          id
        }`
      )
    ).toEqual(
      'recipes/a542e833-edfe-44a3-a6f1-7358b115af4b?fields%5Brecipes%5D=title%2Cdifficulty%2Cid'
    );
  });

  test('Query with kitchen sink', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://live-contentacms.pantheonsite.io',
      apiPrefix: 'api',
    });
    store.params.addInclude(['image']);
    expect(
      store.assembleEndpoint(
        'recipes',
        'https://live-contentacms.pantheonsite.io/api/recipes',
        'a542e833-edfe-44a3-a6f1-7358b115af4b',
        `{
          title
          difficulty
          id
        }`
      )
    ).toEqual(
      'recipes/a542e833-edfe-44a3-a6f1-7358b115af4b?include=image&fields%5Brecipes%5D=title%2Cdifficulty%2Cid'
    );
  });
});
