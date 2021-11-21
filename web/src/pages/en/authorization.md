---
title: Authorization
layout: ../../layouts/MainLayout.astro
---

**tldr; By providing values for `clientId` and `clientSecret`, Drupal State can
make requests to JSON:API endpoints that require authorization.**

```js
const store = new DrupalState({
  apiBase: 'https://live-contentacms.pantheonsite.io',
  apiPrefix: 'api', // apiPrefix defaults to 'jsonapi'
  clientId: 'my-client-id',
  clientSecret: 'my-client-secret',
});

// The following API request will automatically be made with an authorization
// header containing a valid token:
const recipes = await store.getObject({ objectName: 'recipes' });
```

(Note: in most cases sensitive information like secrets should be provided to
Drupal State via environment variables.)

The library currently supports
[Simple OAuth](https://www.drupal.org/project/simple_oauth) using the
`client_credntials` grant type, but we expect to support other authorization
methods in the future.

To better understand the advantages of Drupal State, below we will compare the
process of interacting with these endpoints directly to taking the same approach
using Drupal State's helpers.

## Without Drupal State

We won't go into full detail here, but at a high level if you were authorizing
using the `client_credentials` grant type using the
[Simple OAuth](https://www.drupal.org/project/simple_oauth) module, you would
need to:

- Request a token by making a POST request to the `/oauth/token` endpoint,
  providing the
  [necessary parameters](https://oauth2.thephpleague.com/authorization-server/client-credentials-grant/)
  in the body of the request.
- For future API calls, include the header `Authorization: Bearer {YOUR_TOKEN}`
  containing the token you received.
- The token will expire after a certain amount of time, so for future requests
  you will need to determine if the token is still valid. If it isn't, you'll
  need to request a new token from the `/oauth/token` endpoint and update the
  header on future API requests to use it.

## With Drupal State

```js
const store = new DrupalState({
  apiBase: 'https://live-contentacms.pantheonsite.io',
  apiPrefix: 'api', // apiPrefix defaults to 'jsonapi'
  clientId: 'my-client-id',
  clientSecret: 'my-client-secret',
});

// The following API request will automatically be made with an authorization
// header containing a valid token:
const recipes = await store.getObject({ objectName: 'recipes' });
```

Provide values for `clientId` and `clientSecret` when initializing a new
instance of Drupal State and the library will manage authorization for you
automatically. Drupal State will:

- Negotiate a token.
- Store the token locally.
- Provide an authorization header for all requests.
- Re-use the token as long as it is valid.
- Request a new token when the existing token expires.
