import DrupalState from '../DrupalState';

describe('Correctly assemble endpoints including query params', () => {
  test('No parameters', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
    });
    expect(
      store.assembleEndpoint(
        'node--recipe',
        'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe'
      )
    ).toEqual('https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe');
    expect(
      store.assembleEndpoint('node--recipe', {
        href: 'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe',
      })
    ).toEqual('https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe');
  });

  test('No parameters with ID', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
    });
    expect(
      store.assembleEndpoint(
        'node--recipe',
        'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe',
        '33386d32-a87c-44b9-b66b-3dd0bfc38dca'
      )
    ).toEqual(
      'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe/33386d32-a87c-44b9-b66b-3dd0bfc38dca'
    );
    expect(
      store.assembleEndpoint(
        'node--recipe',
        { href: 'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe' },
        '33386d32-a87c-44b9-b66b-3dd0bfc38dca'
      )
    ).toEqual(
      'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe/33386d32-a87c-44b9-b66b-3dd0bfc38dca'
    );
  });

  test('Parameters, ID and includes', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
    });
    store.params.addInclude(['image']);
    expect(
      store.assembleEndpoint(
        'node--recipe',
        'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe',
        '33386d32-a87c-44b9-b66b-3dd0bfc38dca'
      )
    ).toEqual(
      'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe/33386d32-a87c-44b9-b66b-3dd0bfc38dca?include=image'
    );
    expect(
      store.assembleEndpoint(
        'node--recipe',
        { href: 'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe' },
        '33386d32-a87c-44b9-b66b-3dd0bfc38dca'
      )
    ).toEqual(
      'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe/33386d32-a87c-44b9-b66b-3dd0bfc38dca?include=image'
    );
  });

  test('Parameters and includes, no ID', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
    });
    store.params.addInclude(['image']);
    expect(
      store.assembleEndpoint(
        'node--recipe',
        'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe'
      )
    ).toEqual(
      'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe?include=image'
    );
    expect(
      store.assembleEndpoint('node--recipe', {
        href: 'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe',
      })
    ).toEqual(
      'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe?include=image'
    );
  });

  test('Query', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
    });
    expect(
      store.assembleEndpoint(
        'node--recipe',
        'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe',
        '',
        `{
          title
          field_difficulty
          id
        }`
      )
    ).toEqual(
      'node/recipe?fields%5Bnode--recipe%5D=title%2Cfield_difficulty%2Cid'
    );
  });

  test('Query with ID', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
    });
    expect(
      store.assembleEndpoint(
        'node--recipe',
        'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe',
        '33386d32-a87c-44b9-b66b-3dd0bfc38dca',
        `{
          title
          field_difficulty
          id
        }`
      )
    ).toEqual(
      'node/recipe/33386d32-a87c-44b9-b66b-3dd0bfc38dca?fields%5Bnode--recipe%5D=title%2Cfield_difficulty%2Cid'
    );
  });

  test('Query with kitchen sink', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
    });
    store.params.addInclude(['image']);
    expect(
      store.assembleEndpoint(
        'node--recipe',
        'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe',
        '33386d32-a87c-44b9-b66b-3dd0bfc38dca',
        `{
          title
          field_difficulty
          id
        }`
      )
    ).toEqual(
      'node/recipe/33386d32-a87c-44b9-b66b-3dd0bfc38dca?include=image&fields%5Bnode--recipe%5D=title%2Cfield_difficulty%2Cid'
    );
  });
});
