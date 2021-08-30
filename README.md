# Drupal State

A simple data store to manage application state sourced from Drupal's JSON:API.

## Usage

Create a new instance of Drupal State:

```js
import drupalState from './drupalState';

const store = new drupalState({
  apiRoot: 'https://live-contentacms.pantheonsite.io/api',
});
```

Use the {@link drupalState.default.getObject | getObject method} to retrieve an
object (think collection or resource in JSON:API terms) from your Drupal API. If
you provide only the first argument of objectName, a collection of all objects
of that type will be returned.

```js
// If the object doesn't exist in local state, it will be fetched from the API,
// and then added to the store
const recipesFromApi = await store.getObject('recipes');

// If the object does exist in local state, it will be returned from the store
// without requiring a fetch from the API
const recipesFromStore = await store.getObject('recipes');
```

It is also possible to provide a second argument of ID in order to retrieve a
single object of that type:

```js
// If the object doesn't exist in local state, it will be fetched from the API,
// and then added to the store
await store.getObject('recipes', 'a542e833-edfe-44a3-a6f1-7358b115af4b');

// If the object does exist in local state, it will be returned from the store
// without requiring a fetch from the API
await store.getObject('recipes', 'a542e833-edfe-44a3-a6f1-7358b115af4b');
```

Drupal Store extends [Zustand](https://github.com/pmndrs/zustand), so you also
have access to
[Zustand's Vanilla JS API](https://github.com/pmndrs/zustand#using-zustand-without-react)
if needed:

```js
store.setState({ custom: 'My custom state' });
const myCustomState = store.getState().custom; // Returns 'My custom state'
```

### Utilities

Drupal State also exposes a few utility functions that can be used to interact
with JSON:API endpoints even if you'd prefer to use an alternative state
management solution.

- {@link fetch/fetchApiIndex}: Retrieves index of resource links for the API
- {@link fetch/fetchJsonapiEndpoint}: Retrieves either a collection of objects
  or an individual object from the API

### Debug mode

A Drupal State instance can be configured to run in debug mode. Currently this
results in some additional logging to the console.

```js
const store = new drupalState({
  apiRoot: 'https://live-contentacms.pantheonsite.io/api',
  debug: true,
});
```

## Contributing

### Prerequisites

Steps below assume that you have [NodeJS](https://nodejs.org/) installed. We
recommend using [NVM](https://github.com/nvm-sh/nvm) to manage the NodeJS
version on your local system.

In order to prepare your system for contribution you'll need to complete this
checklist:

1. Run `nvm use` to switch to the expected version of npm. Run `nvm install` if
   you need to update your npm.
2. Run `npm i` to install dependencies.

### Running A Local Development Server

The npm run dev script can be run for local development. It will watch for
changes and launch index.html at http://localhost:3000. index.html loads
src/main.ts which can be used for demonstration purposes and local development.

### Formatting and Linting

Linting and formatting will run for all staged files as a pre-commit hook.

VSCode users can format code on save using the
[Eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
and
[Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
extensions. These extensions will be suggested when loading the project if they
have not already been installed. An example settings file is included in
`.vscode/example.settings.json`. Save this file as `.vscode/settings.json` or
incorporate the contents into your existing settings.json file to enable format
on save in your project.

Formatting on save is highly recommended as it should resolve most formatting
issues before the pre-commit hook runs.

Formatting and linting can also be run manually using the following commands:

- `npm run eslint` - checks linting
- `npm run eslint:fix` - attempts to fix any linting issues
- `npm run prettier` - checks formatting
- `npm run prettier:fix` - attempts to fix any formatting issues

## Testing

This project is configured to run [Jest](https://facebook.github.io/jest/) tests
via `npm run test`. All new code is expected to be covered by tests and these
tests will run as part of our CI process.

Tests should be added in a `__tests__` directory adjacent to the file they are
testing and the files should be named `<fileName>.test.ts`.

## Documentation

All new code should be documented. Documentation is provided by
[TypeDoc](https://typedoc.org/).

To generate documentation run `npm run typedoc` The result will be in the `docs`
folder.

## FAQ

- **Why use the term 'object' instead of 'resource' or 'collection'?** This is
  partially an effort to abstract away things that may be Drupal or JSON:API
  specific in order to make this API friendlier to JS developers who may not be
  familiar with these concepts. It is also driven by a long term desire to for
  this library to support other query languages like GraphQL for which the
  concept of collections or resources may not apply.
