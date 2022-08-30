import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import DrupalState from '../DrupalState';

describe('Correctly assemble endpoints including query params', () => {
  test('No parameters', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
    });
    expect(
      store.assembleEndpoint(
        'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe'
      )
    ).toEqual('https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe');
    expect(
      store.assembleEndpoint(
        'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe'
      )
    ).toEqual('https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe');
  });

  test('No parameters with ID', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
    });
    expect(
      store.assembleEndpoint(
        'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe',
        '33386d32-a87c-44b9-b66b-3dd0bfc38dca'
      )
    ).toEqual(
      'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe/33386d32-a87c-44b9-b66b-3dd0bfc38dca'
    );
    expect(
      store.assembleEndpoint(
        'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe',
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
    const params = new DrupalJsonApiParams();
    params.addInclude(['image']);
    expect(
      store.assembleEndpoint(
        'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe',
        '33386d32-a87c-44b9-b66b-3dd0bfc38dca',
        params
      )
    ).toEqual(
      'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe/33386d32-a87c-44b9-b66b-3dd0bfc38dca?include=image'
    );
    expect(
      store.assembleEndpoint(
        'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe',
        '33386d32-a87c-44b9-b66b-3dd0bfc38dca',
        'include=image'
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
    const params = new DrupalJsonApiParams();
    params.addInclude(['image']);
    expect(
      store.assembleEndpoint(
        'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe',
        '',
        params
      )
    ).toEqual(
      'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe?include=image'
    );
    expect(
      store.assembleEndpoint(
        'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe',
        '',
        'include=image'
      )
    ).toEqual(
      'https://dev-ds-demo.pantheonsite.io/jsonapi/node/recipe?include=image'
    );
  });
  test('should throw an error if the indexHref is not valid', async () => {
    const store: DrupalState = new DrupalState({
      apiBase: 'https://dev-ds-demo.pantheonsite.io',
      apiPrefix: 'jsonapi',
    });
    const params = new DrupalJsonApiParams();
    params.addInclude(['image']);
    expect(() =>
      store.assembleEndpoint(
        '', // force error with invalid endpoint
        '',
        params
      )
    ).toThrow();
  });
});
