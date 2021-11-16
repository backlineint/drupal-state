---
title: Getting Objects
layout: ../../layouts/MainLayout.astro
---

**tldr; Pass the `objectName` parameter to `getObject` to get a deserialized
collection of objects. Add the `id` parameter to get an individual object.**

[![Edit Drupal State Quickstart](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/drupal-state-quickstart-z3rlm?expanddevtools=1&fontsize=14&hidenavigation=1&theme=dark)

```js
import { DrupalState } from '@gdwc/drupal-state';

const store = new DrupalState({
  apiBase: 'https://live-contentacms.pantheonsite.io',
  apiPrefix: 'api',
});

// If the object doesn't exist in local state, it will be fetched from the API
// and then added to the store
const recipesFromApi = await store.getObject({ objectName: 'recipes' });

// Since the object is already in local state as part of the recipes collection,
// this will be returned from the store without requiring a fetch from Drupal.
const recipeFromStore = await store.getObject({
  objectName: 'recipes',
  id: 'a542e833-edfe-44a3-a6f1-7358b115af4b',
});
```

To better understand the advantages of Drupal State, below we will compare the
process of interacting with these endpoints directly to taking the same approach
using Drupal State's helpers.

## Without Drupal State

First, we'll need to determine the endpoint to use. You may know this already,
or you may know enough about Drupal's JSON:API to construct it yourself. But if
you don't, you'll need to make a request to the root API endpoint in order to
retrieve this from an index of endpoints for all resources.

[![Edit Get Collection of Objects - Direct Fetch](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/get-collection-of-objects-direct-fetch-k7utt?fontsize=14&hidenavigation=1&theme=dark)

```js
// Fetch the API index
const apiIndex = await fetch('https://live-contentacms.pantheonsite.io/api')
  .then(response => response.json())
  .then(data => data)
  .catch(error => console.error('API index fetch failed', error));

// With the result, we can determine the recipes endpoint
console.log('recipes endpoint: ', apiIndex.links.recipes);
```

We can now fetch the recipes collection from the API.

```js
// Fetch recipes collection from API
const recipesFromApi = await fetch(apiIndex.links.recipes)
  .then(response => response.json())
  .then(data => data)
  .catch(error => console.error('API fetch failed', error));

// With the result we can access an array of recipe objects
console.log('All recipes:', recipesFromApi.data);
```

Let's say I wanted to access the instructions field for a recipe. We can access
that field under the attributes for the recipe.

```js
const instructions = recipesFromApi.data[0].attributes.instructions;
```

What if at some later point my application needs to get data for a specific
recipe? I could fetch the data from the endpoint for that specific resource, but
that will result in an additional request that could be avoided.

```js
const recipeFromApi = await fetch(
  `${apiIndex.links.recipes}/a542e833-edfe-44a3-a6f1-7358b115af4b`
)
  .then(response => response.json())
  .then(data => data)
  .catch(error => console.error('API fetch failed', error));
```

Alternatively, if I stored the data in application state, I could retrieve it
from the recipes collection we previously requested. But I'd still have to
either search for it, or store it in a way that allows for easy access within
the data store.

```js
// Filter for the resource in application state
const recipeFromState = recipesFromApi.data.filter(item => {
  return item['id'] === 'a542e833-edfe-44a3-a6f1-7358b115af4b';
});
```

## With Drupal State

[![Edit Drupal State Quickstart](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/drupal-state-quickstart-z3rlm?expanddevtools=1&fontsize=14&hidenavigation=1&theme=dark)

```js
import { DrupalState } from '@gdwc/drupal-state';

const store = new DrupalState({
  apiBase: 'https://live-contentacms.pantheonsite.io',
  apiPrefix: 'api',
});

// If the object doesn't exist in local state, it will be fetched from the API
// and then added to the store
const recipesFromApi = await store.getObject({ objectName: 'recipes' });
```

The code above will return a collection of recipes and store them in local
state. As part of that process, Drupal State will also retrieve the root API
index and store it in local state. This will allow it to determine the correct
endpoint for recipes, and allow any other endpoint lookups to be performed
without additional requests.

An array of recipe objects is returned, and we can access individual items.

```js
const recipe = recipesFromApi[0];
```

Alternatively, now that the recipes collection is in local state, we can easily
retrieve an individual recipe from the store without an additional request.

```js
const recipeFromStore = await store.getObject({
  objectName: 'recipes',
  id: 'a542e833-edfe-44a3-a6f1-7358b115af4b',
});
```

The resulting object is deserialized in order to simplify accessing data. For
example, we can access the instructions field with:

```js
const instructions = recipeFromStore.instructions;
```
