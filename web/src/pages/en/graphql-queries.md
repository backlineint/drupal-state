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

const store = new DrupalState({
  apiBase: 'https://live-contentacms.pantheonsite.io',
  apiPrefix: 'api',
});

// Add an include parameter to include relationship data
store.params.addInclude(['category']);
// Provide a GraphQL query to get only the fields you need.
// Queries can even apply to relationship data.
const recipe = await store.getObject({
  objectName: 'recipes',
  id: 'a542e833-edfe-44a3-a6f1-7358b115af4b',
  query: `
    {
      title
      difficulty
      instructions
      category {
        name
      }
    }
  `,
});
```

The above getObject() call returns the following:

```json
recipe: {
  "__typename": "recipes",
  "title": "Frankfurter salad with mustard dressing",
  "difficulty": "easy",
  "instructions": "Bring the potatoes to boil and simmer for 15 minutes in lightly salted water,Drain, cover and keep warm,Hard-boil the eggs for 12 minutes, refresh in cold water, peel and cut into quarters,With a very sharp knife, make a corkscrew shaped score around frankfurters from one end to the other,Bring to the boil and simmer for 5 minutes, drain and keep warm,Add the dressing ingredients to a bowl and whisk well until combined.  Alternatively use a salad shaker or a screw-topped jar,Mix half of the dressing with the spinach and lettuce leaves and the other half with the potatoes and the frankfurters,Divide the salad amongst 4 large plates and dress with the hard-boiled eggs,Season to taste and serve immediately",
  "category": {
    "__typename": "categories",
    "name": "Salad"
  }
}
```

## Without Drupal State

[![Edit Limiting Fields - Direct Fetch](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/limiting-fields-direct-fetch-lm0jk?fontsize=14&hidenavigation=1&theme=dark)

Limiting a JSON:API response to specific fields is possible with some knowledge
of the JSON:API spec. In previous examples, we were fetching our recipe using
the following endpoint and parameters:

`https://live-contentacms.pantheonsite.io/api/recipes/a542e833-edfe-44a3-a6f1-7358b115af4b?include=category`

The response will include all recipe fields along with all fields on the
referenced category.

Thankfully, JSON:API supports
[sparse fieldsets](https://jsonapi.org/format/#fetching-sparse-fieldsets), which
allows you to specify exactly the fields you want in the response. This can be
done by including the fields parameter in the request. To only include our
required fields, we could add the following:

`fields[recipes]=title,difficulty,instructions,category`

That is close, but still gives us all fields for the included category
reference. To further restrict that, we need to also specify fields for the
category as well.

`fields[recipes]=title,difficulty,instructions,category&fields[categories]=name`

Along with our existing include, the full query string becomes:

`fields[recipes]=title,difficulty,instructions,category&fields[categories]=name&include=category`

The data returned will look like this:

```json
Recipe:
{
  "data": {
    "type": "recipes",
    "id": "5d439196-a151-4a2a-95bd-08c2aef302ce",
    "attributes": {
      "title": "Brown shrimp, peas and pasta",
      "difficulty": null,
      "instructions": "Melt half of the butter in a pan, add the garlic and gently sauté until soft, don't allow it to burn or colour.,Add the shrimps, half of the lemon juice and season with salt, pepper. Stir well to mix and then remove from the heat.,Meanwhile cook the peas until tender, either by microwaving or boiling - about 4 minutes,Cook the tagliatelle in salted boiling water until al dente,Drain the pasta and add to the shrimps, Stir in the remaining lemon juice, butter and peas. Mix well, season and serve."
    },
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
    },
    "links": {
      "self": "https://live-contentacms.pantheonsite.io/api/recipes/5d439196-a151-4a2a-95bd-08c2aef302ce"
    }
  },
  "jsonapi": {
    "version": "1.0",
    "meta": {
      "links": {
        "self": "http://jsonapi.org/format/1.0/"
      }
    }
  },
  "links": {
    "self": "https://live-contentacms.pantheonsite.io/api/recipes/5d439196-a151-4a2a-95bd-08c2aef302ce?fields%5Brecipes%5D=title%2Cdifficulty%2Cinstructions%2Ccategory&fields%5Bcategories%5D=name&include=category"
  },
  "included": [
    {
      "type": "categories",
      "id": "12bb3fb4-5ef4-48c6-b71f-730a576b84f6",
      "attributes": {
        "name": "Snack"
      },
      "links": {
        "self": "https://live-contentacms.pantheonsite.io/api/categories/12bb3fb4-5ef4-48c6-b71f-730a576b84f6"
      }
    }
  ]
}
```

## With Drupal State

[![Edit GraphQL Queries](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/graphql-queries-35df4?fontsize=14&hidenavigation=1&theme=dark)

```js
import { DrupalState } from '@gdwc/drupal-state';

const store = new DrupalState({
  apiBase: 'https://live-contentacms.pantheonsite.io',
  apiPrefix: 'api',
});

// Add an include parameter to include relationship data
store.params.addInclude(['category']);
// Provide a GraphQL query to get only the fields you need.
// Queries can even apply to relationship data.
const recipe = await store.getObject({
  objectName: 'recipes',
  id: 'a542e833-edfe-44a3-a6f1-7358b115af4b',
  query: `
    {
      title
      difficulty
      instructions
      category {
        name
      }
    }
  `,
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
  "__typename": "recipes",
  "title": "Frankfurter salad with mustard dressing",
  "difficulty": "easy",
  "instructions": "Bring the potatoes to boil and simmer for 15 minutes in lightly salted water,Drain, cover and keep warm,Hard-boil the eggs for 12 minutes, refresh in cold water, peel and cut into quarters,With a very sharp knife, make a corkscrew shaped score around frankfurters from one end to the other,Bring to the boil and simmer for 5 minutes, drain and keep warm,Add the dressing ingredients to a bowl and whisk well until combined.  Alternatively use a salad shaker or a screw-topped jar,Mix half of the dressing with the spinach and lettuce leaves and the other half with the potatoes and the frankfurters,Divide the salad amongst 4 large plates and dress with the hard-boiled eggs,Season to taste and serve immediately",
  "category": {
    "__typename": "categories",
    "name": "Salad"
  }
}
```

_Addendum: Why not use actual GraphQL? If you have the expertise, you would
almost certainly be better served explicitly defining your schema and using the
[Drupal GraphQL module](https://www.drupal.org/project/graphql). If you don't,
hopefully this feature will be useful to you._
