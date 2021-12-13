---
title: Beyond the Basics
layout: ../../layouts/MainLayout.astro
---

Include related data:

```js
// Add an include parameter to include a related object in the result
store.params.addInclude(['category']);
const recipe = await store.getObject({
  objectName: 'recipes',
  id: 'a542e833-edfe-44a3-a6f1-7358b115af4b',
});

// Fields for the recipe category are now available on the recipe object.
const recipeCategory = recipe.category.name;
```

Specify fields using a GraphQL query (experimental):

```js
// Add an include parameter to include relationship data
store.params.addInclude(['category']);
// Provide a GraphQL query to get only the fields you need.
// Queries can even apply to relationship data.
const recipe = await store.getObject({
  objectName: 'recipes',
  id: 'a542e833-edfe-44a3-a6f1-7358b115af4b',
  query: `
    {
      title
      difficulty
      instructions
      category {
        name
      }
    }
  `,
});
```

Use authorization when sourcing data from Drupal:

```js
const authStore = new DrupalState({
  apiBase: 'https://live-contentacms.pantheonsite.io',
  apiPrefix: 'api',
  clientId: 'my-client-id',
  clientSecret: 'my-client-secret',
});

// The following API request will automatically be made with an authorization
// header containing a valid token using Simple OAuth and the client_credentials
// grant type:
const recipes = await authStore.getObject({ objectName: 'recipes' });
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
