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
  apiBase: 'https://dev-ds-demo.pantheonsite.io',
  apiPrefix: 'jsonapi', // optional, defaults to 'jsonapi'
});
```

Get a collection of objects:

```js
// If the object doesn't exist in local state, it will be fetched from the API
// and then added to the store
const recipesFromApi = await store.getObject({ objectName: 'node--recipe' });
```

Get a single object:

```js
// Since the object is already in local state as part of the recipes collection,
// this will be returned from the store without requiring a fetch from Drupal.
const recipeFromStore = await store.getObject({
  objectName: 'recipes',
  id: '33386d32-a87c-44b9-b66b-3dd0bfc38dca',
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
