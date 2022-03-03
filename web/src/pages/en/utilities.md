---
title: Utilities
layout: ../../layouts/MainLayout.astro
---

**Drupal State also exposes utility functions that can be used to interact with
JSON:API endpoints even if you'd prefer to use an alternative state management
solution.**

- [fetch/fetchApiIndex](/en/api/modules/fetch_fetchapiindex): Retrieves index of
  resource links for the API
- [fetch/fetchJsonapiEndpoint](/en/api/modules/fetch_fetchjsonapiendpoint):
  Retrieves either a collection of objects or an individual object from the API
- [fetch/fetchToken](/en/api/modules/fetch_fetchtoken): Retrieves a token using
  provided credentials.
- [fetch/translatePath](/en/api/modules/fetch_translatepath): helper function to
  make it easier to resolve a path to an entity. Requires installing the
  [Decoupled Router](https://www.drupal.org/project/decoupled_router) module on
  your Drupal site.

```js
import {
  fetchApiIndex,
  fetchJsonapiEndpoint,
  fetchToken,
  translatePath,
} from '@gdwc/drupal-state';

const apiIndexData = await fetchApiIndex(
  'https://dev-ds-demo.pantheonsite.io/jsonapi'
);
const recipes = await fetchJsonapiEndpoint(
  'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/recipe'
);

const tokenRequestBody = {
  grant_type: 'client_credentials',
  client_id: 'MY_ID',
  client_secret: 'MY_SECRET',
};
const tokenResponse = await fetchToken(
  'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/recipe',
  tokenfetchBody
);

const translatedPath = await translatePath(
  'https://dev-ds-demo.pantheonsite.io/router/translate-path',
  '/recipes/fiery-chili-sauce'
);
```
