---
title: Getting Objects by Path
layout: ../../layouts/MainLayout.astro
---

**tldr; Use `getObjectByPath` to get data for the object that
[Decoupled Router](https://www.drupal.org/project/decoupled_router) resolves to
the provided path**

```js
const recipeByPath = await store.getObjectByPath({
  objectName: 'node--recipe',
  path: '/recipes/fiery-chili-sauce',
});
```

When `getObjectByPath` is called, Drupal State will make a request to Decoupled
Router's translate-path endpoint in order to determine the id of the object
associated with the requested path. It will then return data for that object.

The result of the translate-path request is stored in state, so subsequent calls
to `getObjectByPath` will not make additional requests to Decoupled Router.

Use of this feature requires installing the
[Decoupled Router](https://www.drupal.org/project/decoupled_router) module on
your Drupal site.