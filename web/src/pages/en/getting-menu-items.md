---
title: Getting Menu Items
layout: ../../layouts/MainLayout.astro
---

The `getObject` method can also be used to source menu data from Drupal if the
`jsonapi_hypermedia` and `jsonapi_menu_items` modules are enabled.

See https://www.drupal.org/project/jsonapi_hypermedia and
https://www.drupal.org/project/jsonapi_menu_items for more details on enabling
those modules in your Drupal instance.

```js
const menuItems = await store.getObject({
  objectName: 'menu_items--main', // Fetches the menu named `main`
});
```
