---
title: Beyond the Basics
layout: ../../layouts/MainLayout.astro
---

Specify a default locale:

```js
const store = new DrupalState({
  apiBase: 'https://dev-ds-demo.pantheonsite.io',
  defaultLocale: 'en', // optional
});
```

Include related data:

```js
// Using a DrupalJsonApiParams...
import { DrupalJsonApiParams } from 'drupal-json-api-params;

const params = new DrupalJsonApiParams();
// Add an include parameter to include a related object in the result
params.addInclude(['field_recipe_category']);
const recipe = await store.getObject({
  objectName: 'node--recipe',
  id: '33386d32-a87c-44b9-b66b-3dd0bfc38dca',
  params,
});

// Fields for the recipe category are now available on the recipe object.
const recipeCategory = recipe.category.name;
```

```js
// ...Or using a string
const params = 'include=field_recipe_category';
const recipe = await store.getObject({
  objectName: 'node--recipe',
  id: '33386d32-a87c-44b9-b66b-3dd0bfc38dca',
  params,
});
```

Specify fields using a GraphQL query (experimental):

```js
import { DrupalJsonApiParams } from 'drupal-json-api-params;;

const params = new DrupalJsonApiParams();
// Add an include parameter to include relationship data
params.addInclude(['field_recipe_category']);
// Provide a GraphQL query to get only the fields you need.
// Queries can even apply to relationship data.
const recipe = await store.getObject({
  objectName: 'node--recipe',
  id: '33386d32-a87c-44b9-b66b-3dd0bfc38dca',
  query: `
    {
      title
      field_difficulty
      field_recipe_instruction
      field_recipe_category {
        name
      }
    }
  `,
});
```

Use authorization when sourcing data from Drupal:

```js
const authStore = new DrupalState({
  apiBase: 'https://dev-ds-demo.pantheonsite.io',
  apiPrefix: 'jsonapi',
  clientId: 'my-client-id',
  clientSecret: 'my-client-secret',
});

// The following API request will automatically be made with an authorization
// header containing a valid token using Simple OAuth and the client_credentials
// grant type:
const recipes = await authStore.getObject({ objectName: 'node--recipe' });
```

Get a single object by path (the
[Decoupled Router module](https://www.drupal.org/project/decoupled_router) must
be enabled on the Drupal site):

```js
const recipeByPath = await store.getObjectByPath({
  objectName: 'node--recipe',
  path: '/recipes/fiery-chili-sauce',
});
```
