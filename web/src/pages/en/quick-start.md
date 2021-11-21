---
title: Quick Start
layout: ../../layouts/MainLayout.astro
---

Install Drupal State from NPM:

```
npm i @gdwc/drupal-state
```

Import DrupalState in your JavaScript application:

```js
import { DrupalState } from '@gdwc/drupal-state';
```

Create an instance of the store and specify the root of your API:

```js
const store = new DrupalState({
  apiBase: 'https://live-contentacms.pantheonsite.io',
  apiPrefix: 'api', // apiPrefix defaults to 'jsonapi'
});
```

Get a collection of objects:

```js
// If the object doesn't exist in local state, it will be fetched from the API
// and then added to the store
const recipesFromApi = await store.getObject({ objectName: 'recipes' });
```

Get a single object:

```js
// Since the object is already in local state as part of the recipes collection,
// this will be returned from the store without requiring a fetch from Drupal.
const recipeFromStore = await store.getObject({
  objectName: 'recipes',
  id: 'a542e833-edfe-44a3-a6f1-7358b115af4b',
});
```

## Try it!

[![Edit Drupal State Quickstart](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/drupal-state-quickstart-z3rlm?expanddevtools=1&fontsize=14&hidenavigation=1&theme=dark)

<iframe src="https://codesandbox.io/embed/drupal-state-quickstart-z3rlm?expanddevtools=1fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="Drupal State Quickstart"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

## Beyond the Basics

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