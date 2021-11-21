---
title: Including Related Data
layout: ../../layouts/MainLayout.astro
---

**tldr; Use `params.addInclude()` to include related objects in the deserialized
result.**

[![Edit Including Related Data](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/including-related-data-quj2h?fontsize=14&hidenavigation=1&theme=dark)

```js
import { DrupalState } from '@gdwc/drupal-state';

const store = new DrupalState({
  apiBase: 'https://live-contentacms.pantheonsite.io',
  apiPrefix: 'api',
});

// Add an include parameter to include a related object in the result
store.params.addInclude(['category']);
const recipe = await store.getObject({
  objectName: 'recipes',
  id: 'a542e833-edfe-44a3-a6f1-7358b115af4b',
});

// Fields for the recipe category are now available on the recipe object.
const recipeCategory = recipe.category.name;
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
// Add ?include=category to api query string in order to
// include the category entity in the response.
const recipe = await fetch(
  'https://live-contentacms.pantheonsite.io/api/recipes/5d439196-a151-4a2a-95bd-08c2aef302ce?include=category'
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
"included": [
  {
    "type": "categories",
    "id": "12bb3fb4-5ef4-48c6-b71f-730a576b84f6",
    "attributes": {
      "internalId": 4,
      "name": "Snack",
      "description": null,
      "weight": 0,
      "updatedAt": "2017-12-31T12:57:13+0100",
      "path": {
        "alias": null,
        "pid": null,
        "langcode": "en"
      }
    },
    "relationships": {
      "parent": {
        "data": []
      }
    },
    "links": {
      "self": "https://live-contentacms.pantheonsite.io/api/categories/12bb3fb4-5ef4-48c6-b71f-730a576b84f6"
    }
  }
]
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
  "category": {
    "data": {
      "type": "categories",
      "id": "12bb3fb4-5ef4-48c6-b71f-730a576b84f6"
    },
    "links": {
      "self": "https://live-contentacms.pantheonsite.io/api/recipes/5d439196-a151-4a2a-95bd-08c2aef302ce/relationships/category",
      "related": "https://live-contentacms.pantheonsite.io/api/recipes/5d439196-a151-4a2a-95bd-08c2aef302ce/category"
    }
  }
}
```

And we can use that id to retrieve the correct category entity from the
`included` array.

```js
const categoryId = recipe.data.relationships.category.data.id;

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
  apiBase: 'https://live-contentacms.pantheonsite.io',
  apiPrefix: 'api',
});

// Add an include parameter to include a related object in the result
store.params.addInclude(['category']);
const recipe = await store.getObject({
  objectName: 'recipes',
  id: 'a542e833-edfe-44a3-a6f1-7358b115af4b',
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
  "type": "recipes",
  "id": "a542e833-edfe-44a3-a6f1-7358b115af4b",
  "internalId": 1,
  "isPublished": true,
  "title": "Frankfurter salad with mustard dressing",
  "createdAt": "2017-12-31T12:57:13+0100",
  "updatedAt": "2017-12-31T12:57:13+0100",
  "isPromoted": true,
  "path": {
    "alias": null,
    "pid": null,
    "langcode": "en"
  },
  "difficulty": "easy",
  "ingredients": [
    "675 g (1.5 lb) small new salad potatoes such as Pink Fir Apple",
    "3 eggs (not too fresh for hard-boiled eggs)",
    "350 g (12 oz) frankfurters - Siamese cats love Frankfurters!",
    "1 lettuce",
    " chopped.  Any type will do",
    " a Chinese cabbage worked well the last time I made this.",
    "1 packet of young spinach leaves or rocket leaves",
    " about 225 g (8 oz)",
    "A handful of chives",
    " chopped (if in season)",
    "Dressing",
    "3 tablespoons (30 ml) olive oil",
    "1 tablespoon (15 ml) white wine vinegar",
    "Pinch of sugar",
    "Pinch of salt",
    "Dash of lemon juice",
    "2 teaspoons (10 ml) American squeezy mustard",
    "1 teaspoon (5 ml) caraway seeds",
    " crushed in a pestle and mortar"
  ],
  "numberOfServices": null,
  "preparationTime": 5,
  "instructions": "Bring the potatoes to boil and simmer for 15 minutes in lightly salted water,Drain, cover and keep warm,Hard-boil the eggs for 12 minutes, refresh in cold water, peel and cut into quarters,With a very sharp knife, make a corkscrew shaped score around frankfurters from one end to the other,Bring to the boil and simmer for 5 minutes, drain and keep warm,Add the dressing ingredients to a bowl and whisk well until combined.  Alternatively use a salad shaker or a screw-topped jar,Mix half of the dressing with the spinach and lettuce leaves and the other half with the potatoes and the frankfurters,Divide the salad amongst 4 large plates and dress with the hard-boiled eggs,Season to taste and serve immediately",
  "totalTime": 25,
  "links": {
    "self": "https://live-contentacms.pantheonsite.io/api/recipes/a542e833-edfe-44a3-a6f1-7358b115af4b"
  },
  "contentType": {
    "type": "contentTypes",
    "id": "ff85086b-db11-4ba6-8eaf-5197d6ad026c"
  },
  "owner": {
    "type": "users",
    "id": "e12c370f-a118-420b-b096-f5d7a08b5640"
  },
  "category": {
    "type": "categories",
    "id": "529406be-17fa-4080-b98d-19d23eaabb7b",
    "internalId": 1,
    "name": "Salad",
    "description": null,
    "weight": 0,
    "updatedAt": "2017-12-31T12:57:13+0100",
    "path": {
      "alias": null,
      "pid": null,
      "langcode": "en"
    },
    "links": {
      "self": "https://live-contentacms.pantheonsite.io/api/categories/529406be-17fa-4080-b98d-19d23eaabb7b"
    },
    "parent": [],
    "relationshipNames": ["parent"]
  },
  "image": {
    "type": "images",
    "id": "872aa7b3-1b1d-45d2-8bf9-5dd7cb07238f"
  },
  "tags": [
    {
      "type": "tags",
      "id": "df453b94-175f-422d-a090-bd5eb2f004f3"
    }
  ],
  "relationshipNames": ["contentType", "owner", "category", "image", "tags"]
}
```
