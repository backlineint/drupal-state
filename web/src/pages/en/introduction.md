---
title: Drupal State
layout: ../../layouts/MainLayout.astro
---

**A lightweight data store and utilities intended to simplify managing data
sourced from Drupal.**

[Drupal Core](https://www.drupal.org/) offers a fantastic set of
[zero-config API endpoints](https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module/api-overview)
that can make content from Drupal easily available to any JavaScript frontend.
But consuming this data can require custom code along with an understanding of
both the [JSON:API specification](https://jsonapi.org/) and some amount of
Drupal specific knowledge.

Drupal State aims to bridge this gap by offering a common set of utilities that
allow JavaScript developers with limited knowledge of Drupal or the JSON:API
spec to take advantage of the best features of Drupal's APIs. These utilities
can also be used by related projects in the Drupal ecosystem so that the
community can spend less time re-solving common problems and more time pushing
Decoupled Drupal forward.

Features include:

- ✅ **Retrieve an object from Drupal's API, then serve all future requests for
  that object from local state.**

- ✅ **Framework agnostic - use with vanilla JS or any of your favorite
  JavaScript frameworks.**

- ✅ **API data is represented in a simplified, deserialized structure.**

- ✅ **Easily add filters and include additional resources using
  [Drupal JSON:API Params](https://www.npmjs.com/package/drupal-jsonapi-params).**

- ✅ **Universal - can be used on both client side and server side.**

- ✅ **Access the store directly when necessary.**

- ✅ **Import individual utility functions like `fetchApiIndex` and
  `fetchJsonApiEndpoint` if you only need some of the features of Drupal
  State.**

- ✅ **Write GraphQL queries against Drupal's Core JSON:API endpoints.
  (Experimental)**

Plus much more on the roadmap. Have a feature request? Submit it in
[the issue queue](https://www.drupal.org/project/issues/drupal_state?categories=All).
