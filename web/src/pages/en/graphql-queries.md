---
title: GraphQL Queries (Experimental)
layout: ../../layouts/MainLayout.astro
---

**tldr; Drupal State allows GraphQL queries to be made against Drupal's JSON:API
endpoints. The API request will only include the fields derived from the query,
thus reducing the response payload automatically.**

[![Edit GraphQL Queries](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/graphql-queries-35df4?fontsize=14&hidenavigation=1&theme=dark)

```js
import { DrupalState } from '@gdwc/drupal-state';
// You may use the drupal-json-api library to help build query string params
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';

const store = new DrupalState({
  apiBase: 'https://dev-ds-demo.pantheonsite.io',
  apiPrefix: 'jsonapi',
});

const params = new DrupalJsonApiParams();
// Add an include parameter to include relationship data
params.addInclude(['field_recipe_category']);
// Provide a GraphQL query to get only the fields you need.
// Queries can even apply to relationship data.
const recipe = await store.getObject({
  objectName: 'node--recipe',
  id: '33386d32-a87c-44b9-b66b-3dd0bfc38dca',
  query: `
    {
      title
      field_difficulty
      field_recipe_instruction
      field_recipe_category {
        name
      }
    }
  `,
  params: params,
});
```

The above getObject() call returns the following:

```json
recipe: {
  "__typename": "node--recipe",
  "title": "Deep mediterranean quiche",
  "field_difficulty": "medium",
  "field_recipe_instruction": {
    "value": "Preheat the oven to 400°F/200°C. Starting with the pastry; rub the flour and butter together in a bowl until crumbling like breadcrumbs. Add water, a little at a time, until it forms a dough.
Roll out the pastry on a floured board and gently spread over your tin. Place in the fridge for 20 minutes before blind baking for a further 10.
Whilst the pastry is cooling, chop and gently cook the onions, garlic and courgette.
In a large bowl, add the soya milk, half the parmesan, and the eggs. Gently mix.
Once the pastry is cooked, spread the onions, garlic and sun dried tomatoes over the base and pour the eggs mix over. Sprinkle the remaining parmesan and careful lay the feta over the top. Bake for 30 minutes or until golden brown.",
    "format": "basic_html",
    "processed": "Preheat the oven to 400°F/200°C. Starting with the pastry; rub the flour and butter together in a bowl until crumbling like breadcrumbs. Add water, a little at a time, until it forms a dough. Roll out the pastry on a floured board and gently spread over your tin. Place in the fridge for 20 minutes before blind baking for a further 10. Whilst the pastry is cooling, chop and gently cook the onions, garlic and courgette. In a large bowl, add the soya milk, half the parmesan, and the eggs. Gently mix. Once the pastry is cooked, spread the onions, garlic and sun dried tomatoes over the base and pour the eggs mix over. Sprinkle the remaining parmesan and careful lay the feta over the top. Bake for 30 minutes or until golden brown."
  },
  "field_recipe_category": [
    {
      "__typename": "taxonomy_term--recipe_category",
      "name": "Main courses"
    }
  ]
}
```

## Without Drupal State

[![Edit Limiting Fields - Direct Fetch](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/limiting-fields-direct-fetch-lm0jk?fontsize=14&hidenavigation=1&theme=dark)

Limiting a JSON:API response to specific fields is possible with some knowledge
of the JSON:API spec. In previous examples, we were fetching our recipe using
the following endpoint and parameters:

`https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/recipe/33386d32-a87c-44b9-b66b-3dd0bfc38dca?include=field_recipe_category&fields%5Bnode--recipe%5D=title%2Cfield_difficulty%2Cfield_recipe_instruction%2Cfield_recipe_category`

The response will include all recipe fields along with all fields on the
referenced category.

Thankfully, JSON:API supports
[sparse fieldsets](https://jsonapi.org/format/#fetching-sparse-fieldsets), which
allows you to specify exactly the fields you want in the response. This can be
done by including the fields parameter in the request. To only include our
required fields, we could add the following:

`fields[node--recipe]=title,field_difficulty,field_recipe_instruction,field_recipe_category`

That is close, but still gives us all fields for the included category
reference. To further restrict that, we need to also specify fields for the
category as well.

`fields[node--recipe]=title,difficulty,instructions,category&fields[categories]=name`

Along with our existing include, the full query string becomes:

`fields[node--recipe]=title,difficulty,instructions,category&fields[categories]=name&include=category`

The data returned will look like this:

```json
Recipe:
{
  "jsonapi": {
    "version": "1.0",
    "meta": {
      "links": {
        "self": {
          "href": "http://jsonapi.org/format/1.0/"
        }
      }
    }
  },
  "data": {
    "type": "node--recipe",
    "id": "33386d32-a87c-44b9-b66b-3dd0bfc38dca",
    "links": {
      "self": {
        "href": "https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/recipe/33386d32-a87c-44b9-b66b-3dd0bfc38dca?resourceVersion=id%3A2"
      }
    },
    "attributes": {
      "title": "Deep mediterranean quiche",
      "field_difficulty": "medium",
      "field_recipe_instruction": {
        "value": "<ol>\n  <li>Preheat the oven to 400°F/200°C. Starting with the pastry; rub the flour and butter together in a bowl until crumbling like breadcrumbs. Add water, a little at a time, until it forms a dough.</li>\n  <li>Roll out the pastry on a floured board and gently spread over your tin. Place in the fridge for 20 minutes before blind baking for a further 10.</li>\n  <li>Whilst the pastry is cooling, chop and gently cook the onions, garlic and courgette.</li>\n  <li>In a large bowl, add the soya milk, half the parmesan, and the eggs. Gently mix.</li>\n  <li>Once the pastry is cooked, spread the onions, garlic and sun dried tomatoes over the base and pour the eggs mix over. Sprinkle the remaining parmesan and careful lay the feta over the top. Bake for 30 minutes or until golden brown.</li>\n</ol>\n",
        "format": "basic_html",
        "processed": "<ol>\n<li>Preheat the oven to 400°F/200°C. Starting with the pastry; rub the flour and butter together in a bowl until crumbling like breadcrumbs. Add water, a little at a time, until it forms a dough.</li>\n<li>Roll out the pastry on a floured board and gently spread over your tin. Place in the fridge for 20 minutes before blind baking for a further 10.</li>\n<li>Whilst the pastry is cooling, chop and gently cook the onions, garlic and courgette.</li>\n<li>In a large bowl, add the soya milk, half the parmesan, and the eggs. Gently mix.</li>\n<li>Once the pastry is cooked, spread the onions, garlic and sun dried tomatoes over the base and pour the eggs mix over. Sprinkle the remaining parmesan and careful lay the feta over the top. Bake for 30 minutes or until golden brown.</li>\n</ol>\n"
      }
    },
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
  },
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
  ],
  "links": {
    "self": {
      "href": "https://dev-ds-demo.pantheonsite.io/en/jsonapi/node/recipe/33386d32-a87c-44b9-b66b-3dd0bfc38dca?fields%5Bnode--recipe%5D=title%2Cfield_difficulty%2Cfield_recipe_instruction%2Cfield_recipe_category&include=field_recipe_category"
    }
  }
}
```

## With Drupal State

[![Edit GraphQL Queries](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/graphql-queries-35df4?fontsize=14&hidenavigation=1&theme=dark)

```js
import { DrupalState } from '@gdwc/drupal-state';

const store = new DrupalState({
  apiBase: 'https://dev-ds-demo.pantheonsite.io',
  apiPrefix: 'jsonapi',
});

// Provide a GraphQL query to get only the fields you need.
// Queries can even apply to relationship data.
const recipe = await store.getObject({
  objectName: 'node--recipe',
  id: '33386d32-a87c-44b9-b66b-3dd0bfc38dca',
  query: `
    {
      title
      field_difficulty
      field_recipe_instruction
      field_recipe_category {
        name
      }
    }
  `,
  params: 'include=field_recipe_category',
});
```

In this case, Drupal State is really just providing a different approach to
provide a similar end result. The API request made behind the scenes is still
the same, containing all of the query string parameters necessary to restrict
the data included in the payload:

`https://live-contentacms.pantheonsite.io/api/recipes/a542e833-edfe-44a3-a6f1-7358b115af4b?fields[recipes]=title,difficulty,instructions,category&fields[categories]=name&include=category`

The difference is that rather than defining the structure of the API request,
the developer defines the desired structure as a GraphQL query and Drupal State
automatically constructs an efficient API request based on that information. For
a developer who has experience with GraphQL, but limited experience with the
JSON:API spec, this will make it easier to avoid over fetching from Drupal's API
endpoints.

In addition, the deserialized result is even more streamlined compared to the
response when interacting with the API directly.

```json
recipe: {
    "__typename": "node--recipe",
    "title": "Deep mediterranean quiche",
    "field_difficulty": "medium",
    "field_recipe_instruction": {
        "value": "<ol>  <li>Preheat the oven to 400°F/200°C. Starting with the pastry; rub the flour and butter together in a bowl until crumbling like breadcrumbs. Add water, a little at a time, until it forms a dough.</li>  <li>Roll out the pastry on a floured board and gently spread over your tin. Place in the fridge for 20 minutes before blind baking for a further 10.</li>  <li>Whilst the pastry is cooling, chop and gently cook the onions, garlic and courgette.</li>  <li>In a large bowl, add the soya milk, half the parmesan, and the eggs. Gently mix.</li>  <li>Once the pastry is cooked, spread the onions, garlic and sun dried tomatoes over the base and pour the eggs mix over. Sprinkle the remaining parmesan and careful lay the feta over the top. Bake for 30 minutes or until golden brown.</li></ol>",
        "format": "basic_html",
        "processed": "<ol><li>Preheat the oven to 400°F/200°C. Starting with the pastry; rub the flour and butter together in a bowl until crumbling like breadcrumbs. Add water, a little at a time, until it forms a dough.</li><li>Roll out the pastry on a floured board and gently spread over your tin. Place in the fridge for 20 minutes before blind baking for a further 10.</li><li>Whilst the pastry is cooling, chop and gently cook the onions, garlic and courgette.</li><li>In a large bowl, add the soya milk, half the parmesan, and the eggs. Gently mix.</li><li>Once the pastry is cooked, spread the onions, garlic and sun dried tomatoes over the base and pour the eggs mix over. Sprinkle the remaining parmesan and careful lay the feta over the top. Bake for 30 minutes or until golden brown.</li></ol>"
    },
    "field_recipe_category": [
        {
            "__typename": "taxonomy_term--recipe_category",
            "name": "Main courses"
        }
    ]
}
```

_Addendum: Why not use actual GraphQL? If you have the expertise, you would
almost certainly be better served explicitly defining your schema and using the
[Drupal GraphQL module](https://www.drupal.org/project/graphql). If you don't,
hopefully this feature will be useful to you._
