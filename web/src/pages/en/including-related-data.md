---
title: Including Related Data
layout: ../../layouts/MainLayout.astro
---

**tldr; Build your own query string or use the drupal-jsonapi-params library to
include related objects in the deserialized result.**

[![Edit Including Related Data](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/including-related-data-quj2h?fontsize=14&hidenavigation=1&theme=dark)

```js
import { DrupalState } from '@gdwc/drupal-state';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';

const store = new DrupalState({
  apiBase: 'https://dev-ds-demo.pantheonsite.io',
  apiPrefix: 'jsonapi',
});

// create a new instance of DrupalJsonApiParams
const params = new DrupalJsonApiParams();
// or you may wish to use another library or construct your own query string parameters.
// Make sure the query string is valid and does not start with a "?"
// see https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module/fetching-resources-get for valid requests
// const paramsString = "include=field_recipe_category"

// Add an include parameter to include a related object in the result
params.addInclude(['field_recipe_category']);
const recipe = await store.getObject({
  objectName: 'node--recipe',
  id: '33386d32-a87c-44b9-b66b-3dd0bfc38dca',
  // The object has the same name as the key, so we can omit the key.
  params,
  // If you are using a paramString or an object with a different name:
  // params: paramsString
});

// Fields for the recipe category are now available on the recipe object.
const recipeCategory = recipe['field_recipe_category'][0].name;
```

To better understand the advantages of Drupal State, below we will compare the
process of interacting with these endpoints directly to taking the same approach
using Drupal State's helpers.

As shown above, let’s look at the example of getting the name of a category that
is referenced on a recipe object.

## Without Drupal State

JSON:API responses can include relationships, which are references to other
standalone entities. By default, the response only includes the ID of the
related entity. To include the related entity, we can add an `include` parameter
to the API request.

[![Edit Including Related Data - Direct Fetch](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/including-related-data-direct-fetch-6yjfi?fontsize=14&hidenavigation=1&theme=dark)

```js
// Add ?include=field_recipe_category to api query string in order to
// include the category entity in the response.
const recipe = await fetch(
  'https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/recipe/33386d32-a87c-44b9-b66b-3dd0bfc38dca?include=field_recipe_category'
)
  .then(response => response.json())
  .then(data => data)
  .catch(error => console.error('API fetch failed', error));

// Fields for the category entity are available in the response,
// but take some work to get at.
const recipeCategory = recipe.included[0].attributes.name;
```

The category name is now available in the response, but reliably accessing that
data can be challenging. Here's a closer look at `recipe.included`

```json
{
  "included": [
    {
      "type": "taxonomy_term--recipe_category",
      "id": "92972052-3377-47fc-a038-b61e56f3a8cb",
      "links": {
        "self": {
          "href": "https://dev-ds-demo.pantheonsite.io/en/jsonapi/taxonomy_term/recipe_category/92972052-3377-47fc-a038-b61e56f3a8cb"
        }
      },
      "attributes": {
        "drupal_internal__tid": 31,
        "drupal_internal__revision_id": 31,
        "langcode": "en",
        "revision_created": "2022-02-16T22:40:41+00:00",
        "revision_log_message": null,
        "status": true,
        "name": "Main courses",
        "description": null,
        "weight": 0,
        "changed": "2022-02-16T22:40:41+00:00",
        "default_langcode": true,
        "revision_translation_affected": true,
        "path": {
          "alias": "/recipe-category/main-courses",
          "pid": 61,
          "langcode": "en"
        },
        "content_translation_source": "und",
        "content_translation_outdated": false,
        "content_translation_created": "2022-02-16T22:40:41+00:00"
      },
      "relationships": {
        "vid": {
          "data": {
            "type": "taxonomy_vocabulary--taxonomy_vocabulary",
            "id": "b7084f66-91cc-4c28-ac05-d0b246223617",
            "meta": {
              "drupal_internal__target_id": "recipe_category"
            }
          },
          "links": {
            "related": {
              "href": "https://dev-ds-demo.pantheonsite.io/en/jsonapi/taxonomy_term/recipe_category/92972052-3377-47fc-a038-b61e56f3a8cb/vid"
            },
            "self": {
              "href": "https://dev-ds-demo.pantheonsite.io/en/jsonapi/taxonomy_term/recipe_category/92972052-3377-47fc-a038-b61e56f3a8cb/relationships/vid"
            }
          }
        },
        "revision_user": {
          "data": null,
          "links": {
            "related": {
              "href": "https://dev-ds-demo.pantheonsite.io/en/jsonapi/taxonomy_term/recipe_category/92972052-3377-47fc-a038-b61e56f3a8cb/revision_user"
            },
            "self": {
              "href": "https://dev-ds-demo.pantheonsite.io/en/jsonapi/taxonomy_term/recipe_category/92972052-3377-47fc-a038-b61e56f3a8cb/relationships/revision_user"
            }
          }
        },
        "parent": {
          "data": [
            {
              "type": "taxonomy_term--recipe_category",
              "id": "virtual",
              "meta": {
                "links": {
                  "help": {
                    "href": "https://www.drupal.org/docs/8/modules/json-api/core-concepts#virtual",
                    "meta": {
                      "about": "Usage and meaning of the 'virtual' resource identifier."
                    }
                  }
                }
              }
            }
          ],
          "links": {
            "related": {
              "href": "https://dev-ds-demo.pantheonsite.io/en/jsonapi/taxonomy_term/recipe_category/92972052-3377-47fc-a038-b61e56f3a8cb/parent"
            },
            "self": {
              "href": "https://dev-ds-demo.pantheonsite.io/en/jsonapi/taxonomy_term/recipe_category/92972052-3377-47fc-a038-b61e56f3a8cb/relationships/parent"
            }
          }
        },
        "content_translation_uid": {
          "data": {
            "type": "user--user",
            "id": "2b379cf9-c5ba-49ee-af7f-7c2ac8a5966c",
            "meta": {
              "drupal_internal__target_id": 0
            }
          },
          "links": {
            "related": {
              "href": "https://dev-ds-demo.pantheonsite.io/en/jsonapi/taxonomy_term/recipe_category/92972052-3377-47fc-a038-b61e56f3a8cb/content_translation_uid"
            },
            "self": {
              "href": "https://dev-ds-demo.pantheonsite.io/en/jsonapi/taxonomy_term/recipe_category/92972052-3377-47fc-a038-b61e56f3a8cb/relationships/content_translation_uid"
            }
          }
        }
      }
    }
  ]
}
```

`included` is an array of objects. While in this example, there is only one
object, the include parameter can take multiple values. If for example the
include was `?include=contentType,category,tags` then `included` would contain
multiple objects in an order we might not be able to anticipate. So we'd once
again need to filter the object in order to find the included category entity.

The `relationships` object in the response tells us the id of the category
entity.

```json
  "relationships": {
  "field_recipe_category": {
    "data": [
      {
        "type": "taxonomy_term--recipe_category",
        "id": "92972052-3377-47fc-a038-b61e56f3a8cb",
        "meta": {
          "drupal_internal__target_id": 31
        }
      }
    ],
    "links": {
      "related": {
        "href": "https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/recipe/33386d32-a87c-44b9-b66b-3dd0bfc38dca/field_recipe_category?resourceVersion=id%3A2"
      },
      "self": {
        "href": "https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/recipe/33386d32-a87c-44b9-b66b-3dd0bfc38dca/relationships/field_recipe_category?resourceVersion=id%3A2"
      }
    }
  }
}
```

And we can use that id to retrieve the correct category entity from the
`included` array.

```js
const categoryId = recipe.data.relationships[field_recipe_category].data.id;

// Filter for the category in the included array
const category = recipe.included.filter(item => {
  return item['id'] === categoryId;
});

// Access the name attribute
const categoryName = category[0].attributes.name;
```

## With Drupal State

[![Edit Including Related Data](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/including-related-data-quj2h?fontsize=14&hidenavigation=1&theme=dark)

```js
import { DrupalState } from '@gdwc/drupal-state';

const store = new DrupalState({
  apiBase: 'https://dev-ds-demo.pantheonsite.io',
  apiPrefix: 'jsonapi',
});

const recipe = await store.getObject({
  objectName: 'node--recipe',
  id: '33386d32-a87c-44b9-b66b-3dd0bfc38dca',
  params: 'include=field_recipe_category',
});

// Fields for the recipe category are now available on the recipe object.
const recipeCategory = recipe.category.name;
```

Drupal State's helpers streamline the process of managing API query parameters
and fetching a particular resource. But perhaps the biggest impact is the
deserialized result, which also contains any included objects. We can access the
category name directly as `recipe.category.name` without needing to search an
array of included objects.

```json
recipe: {
  "type": "node--recipe",
  "id": "33386d32-a87c-44b9-b66b-3dd0bfc38dca",
  "drupal_internal__nid": 1,
  "drupal_internal__vid": 2,
  "langcode": "en",
  "revision_timestamp": "2022-02-16T22:40:41+00:00",
  "revision_log": null,
  "status": true,
  "title": "Deep mediterranean quiche",
  "created": "2022-02-16T22:40:41+00:00",
  "changed": "2022-02-16T22:40:41+00:00",
  "promote": true,
  "sticky": false,
  "default_langcode": true,
  "revision_translation_affected": null,
  "moderation_state": "published",
  "path": {
    "alias": "/recipes/deep-mediterranean-quiche",
    "pid": 67,
    "langcode": "en"
  },
  "content_translation_source": "und",
  "content_translation_outdated": false,
  "field_cooking_time": 30,
  "field_difficulty": "medium",
  "field_ingredients": [
    "For the pastry:",
    "280g plain flour",
    "140g butter",
    "Cold water",
    "For the filling:",
    "1 onion",
    "2 garlic cloves",
    "Half a courgette",
    "450ml soya milk",
    "500g grated parmesan",
    "2 eggs",
    "200g sun dried tomatoes",
    "100g feta"
  ],
  "field_number_of_servings": 8,
  "field_preparation_time": 40,
  "field_recipe_instruction": {
    "value": "Preheat the oven to 400°F/200°C. Starting with the pastry; rub the flour and butter together in a bowl until crumbling like breadcrumbs. Add water, a little at a time, until it forms a dough. Roll out the pastry on a floured board and gently spread over your tin. Place in the fridge for 20 minutes before blind baking for a further 10. Whilst the pastry is cooling, chop and gently cook the onions, garlic and courgette. In a large bowl, add the soya milk, half the parmesan, and the eggs. Gently mix. Once the pastry is cooked, spread the onions, garlic and sun dried tomatoes over the base and pour the eggs mix over. Sprinkle the remaining parmesan and careful lay the feta over the top. Bake for 30 minutes or until golden brown.",
    "format": "basic_html",
    "processed": "Preheat the oven to 400°F/200°C. Starting with the pastry; rub the flour and butter together in a bowl until crumbling like breadcrumbs. Add water, a little at a time, until it forms a dough. Roll out the pastry on a floured board and gently spread over your tin. Place in the fridge for 20 minutes before blind baking for a further 10. Whilst the pastry is cooling, chop and gently cook the onions, garlic and courgette. In a large bowl, add the soya milk, half the parmesan, and the eggs. Gently mix. Once the pastry is cooked, spread the onions, garlic and sun dried tomatoes over the base and pour the eggs mix over. Sprinkle the remaining parmesan and careful lay the feta over the top. Bake for 30 minutes or until golden brown."
  },
  "field_summary": {
    "value": "An Italian inspired quiche with sun dried tomatoes and courgette. A perfect light meal for a summer's day.",
    "format": "basic_html",
    "processed": "An Italian inspired quiche with sun dried tomatoes and courgette. A perfect light meal for a summer's day."
  },
  "links": {
    "self": {
      "href": "https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/recipe/33386d32-a87c-44b9-b66b-3dd0bfc38dca?resourceVersion=id%3A2"
    }
  },
  "node_type": {
    "type": "node_type--node_type",
    "id": "1c42f343-4d30-4fa3-a5c6-919daa61b952",
    "resourceIdObjMeta": {
      "drupal_internal__target_id": "recipe"
    }
  },
  "revision_uid": {
    "type": "user--user",
    "id": "a7d16dca-adbb-4e56-a32d-ebc72cf95226",
    "resourceIdObjMeta": {
      "drupal_internal__target_id": 5
    }
  },
  "uid": {
    "type": "user--user",
    "id": "a7d16dca-adbb-4e56-a32d-ebc72cf95226",
    "resourceIdObjMeta": {
      "drupal_internal__target_id": 5
    }
  },
  "field_media_image": {
    "type": "media--image",
    "id": "0d272ac0-cd03-42bf-aba9-9d403fc6680b",
    "resourceIdObjMeta": {
      "drupal_internal__target_id": 1
    }
  },
  "field_recipe_category": [
    {
      "type": "taxonomy_term--recipe_category",
      "id": "92972052-3377-47fc-a038-b61e56f3a8cb",
      "drupal_internal__tid": 31,
      "drupal_internal__revision_id": 31,
      "langcode": "en",
      "revision_created": "2022-02-16T22:40:41+00:00",
      "revision_log_message": null,
      "status": true,
      "name": "Main courses",
      "description": null,
      "weight": 0,
      "changed": "2022-02-16T22:40:41+00:00",
      "default_langcode": true,
      "revision_translation_affected": true,
      "path": {
        "alias": "/recipe-category/main-courses",
        "pid": 61,
        "langcode": "en"
      },
      "content_translation_source": "und",
      "content_translation_outdated": false,
      "content_translation_created": "2022-02-16T22:40:41+00:00",
      "links": {
        "self": {
          "href": "https://dev-ds-demo.pantheonsite.io/en/jsonapi/taxonomy_term/recipe_category/92972052-3377-47fc-a038-b61e56f3a8cb"
        }
      },
      "resourceIdObjMeta": {
        "drupal_internal__target_id": 31
      },
      "vid": {
        "type": "taxonomy_vocabulary--taxonomy_vocabulary",
        "id": "b7084f66-91cc-4c28-ac05-d0b246223617",
        "resourceIdObjMeta": {
          "drupal_internal__target_id": "recipe_category"
        }
      },
      "revision_user": null,
      "parent": [
        {
          "type": "taxonomy_term--recipe_category",
          "id": "virtual",
          "resourceIdObjMeta": {
            "links": {
              "help": {
                "href": "https://www.drupal.org/docs/8/modules/json-api/core-concepts#virtual",
                "meta": {
                  "about": "Usage and meaning of the 'virtual' resource identifier."
                }
              }
            }
          }
        }
      ],
      "content_translation_uid": {
        "type": "user--user",
        "id": "2b379cf9-c5ba-49ee-af7f-7c2ac8a5966c",
        "resourceIdObjMeta": {
          "drupal_internal__target_id": 0
        }
      },
      "relationshipNames": [
        "vid",
        "revision_user",
        "parent",
        "content_translation_uid"
      ]
    }
  ],
  "field_tags": [
    {
      "type": "taxonomy_term--tags",
      "id": "ee3f8fd1-873f-46fa-bb15-3e1e6647e693",
      "resourceIdObjMeta": {
        "drupal_internal__target_id": 22
      }
    },
    {
      "type": "taxonomy_term--tags",
      "id": "4dbb782c-86c2-4ac1-b896-55b10be37fff",
      "resourceIdObjMeta": {
        "drupal_internal__target_id": 13
      }
    }
  ],
  "relationshipNames": [
    "node_type",
    "revision_uid",
    "uid",
    "field_media_image",
    "field_recipe_category",
    "field_tags"
  ]
}
```
