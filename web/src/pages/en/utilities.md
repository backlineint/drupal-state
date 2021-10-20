---
title: Utilities
layout: ../../layouts/MainLayout.astro
---

**Drupal State also exposes a few utility functions that can be used to interact
with JSON:API endpoints even if you'd prefer to use an alternative state
management solution.**

- [fetch/fetchApiIndex](/en/modules/fetch_fetchapiindex): Retrieves index of
  resource links for the API
- [fetch/fetchJsonapiEndpoint](/en/modules/fetch_fetchjsonapiendpoint):
  Retrieves either a collection of objects or an individual object from the API

```js
import { fetchApiIndex, fetchJsonapiEndpoint } from '@gdwc/drupal-state';

const apiIndexData = await fetchApiIndex(
  'https://live-contentacms.pantheonsite.io/api'
);
const recipes = await fetchJsonapiEndpoint(
  'https://live-contentacms.pantheonsite.io/api/recipes'
);
```
