import DrupalState from './DrupalState';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!;

const store: any = new DrupalState({
  apiBase: 'https://live-contentacms.pantheonsite.io',
  apiPrefix: 'api',
  debug: true,
});

// Uncomment to use authenticated store - currently depends on local environment
// const authStore: any = new DrupalState({
//   apiBase: 'https://demo-decoupled-bridge.lndo.site',
//   apiPrefix: 'jsonapi',
//   defaultLocale: 'en',
//   clientId: 'my-client-id',
//   clientSecret: 'mysecret',
//   debug: true,
// });

async function main(): Promise<void> {
  // Include images in response
  store.params.addInclude(['image']);

  console.log(
    '--- If no resources are in state, create a new resource object ---'
  );
  console.log(
    await store.getObject({
      objectName: 'recipes',
      id: 'a542e833-edfe-44a3-a6f1-7358b115af4b',
    })
  );
  console.log(
    '--- If a resource is in state, use the local version rather than fetching ---'
  );
  console.log(
    await store.getObject({
      objectName: 'recipes',
      id: 'a542e833-edfe-44a3-a6f1-7358b115af4b',
    })
  );

  console.log('--- Fetch and add to the existing resource object ---');
  console.log(
    await store.getObject({
      objectName: 'recipes',
      id: '84cfaa18-faca-471f-bfa5-fbb8c199d039',
    })
  );
  console.log(
    '--- If a resource is in state, use the local version rather than fetching ---'
  );
  console.log(
    await store.getObject({
      objectName: 'recipes',
      id: '84cfaa18-faca-471f-bfa5-fbb8c199d039',
    })
  );

  console.log('--- Fetch a collection ---');
  console.log(
    await store.getObject({
      objectName: 'recipes',
    })
  );
  console.log('--- Get collection from state if it already exists ---');
  console.log(
    await store.getObject({
      objectName: 'recipes',
    })
  );
  console.log('--- If a resource exists in collection state, use that ---');
  console.log(
    await store.getObject({
      objectName: 'recipes',
      id: '1c134a16-01ab-4133-ae1f-6e078fe1f64b',
    })
  );

  console.log('--- Fetch a resource with a query ---');
  // Note: query based resources can't be retrieved from collection state because
  // the query may not contain the ID.
  console.log(
    await store.getObject({
      objectName: 'recipes',
      id: '912e092f-a7d5-41ae-9e92-e23ffa357b28',
      query: `{
        title
        difficulty
        id
      }`,
    })
  );

  console.log(
    '--- Fetch a resource with a query from state if it already exists ---'
  );
  console.log(
    await store.getObject({
      objectName: 'recipes',
      id: '912e092f-a7d5-41ae-9e92-e23ffa357b28',
      query: `{
        title
        difficulty
        id
      }`,
    })
  );

  console.log('--- Fetch a collection with a query ---');
  console.log(
    await store.getObject({
      objectName: 'pages',
      query: `{
        title
        id
      }`,
    })
  );

  console.log(
    '--- Fetch a collection with a query from state if it already exists ---'
  );
  console.log(
    await store.getObject({
      objectName: 'pages',
      query: `{
        title
        id
      }`,
    })
  );

  console.log('--- Fetch _all_ objects of a type ---');
  console.log(
    await store.getObject({
      objectName: 'files',
      all: true,
    })
  );

  console.log('--- Fetch _all_ objects of a type with a query---');
  console.log(
    await store.getObject({
      objectName: 'files',
      all: true,
      query: `{
          filename
          id
        }`,
    })
  );

  console.log(store.getState());
  // Uncomment to use authenticated store - currently depends on local environment

  // console.log(
  //   '--- Fetch an object by path where path needs to be translated ---'
  // );
  // console.log(
  //   await authStore.getObjectByPath({
  //     objectName: 'node--recipe',
  //     path: '/recipes/fiery-chili-sauce',
  //   })
  // );
  // console.log('--- Add a second path to dsPathTranslations in state ---');
  // console.log(
  //   await authStore.getObjectByPath({
  //     objectName: 'node--recipe',
  //     path: '/recipes/victoria-sponge-cake',
  //   })
  // );
  // console.log('--- Use path translation in state if it already exists ---');
  // console.log(
  //   await authStore.getObjectByPath({
  //     objectName: 'node--recipe',
  //     path: '/recipes/victoria-sponge-cake',
  //   })
  // );

  // console.log('--- Get taxonomy with authentication ---');
  // console.log(
  //   await authStore.getObject({
  //     objectName: 'taxonomy_vocabulary--taxonomy_vocabulary',
  //   })
  // );

  // console.log('--- Get pages with authentication and a query ---');
  // console.log(
  //   await authStore.getObject({
  //     objectName: 'node--page',
  //     query: `{
  //       title
  //       id
  //     }`,
  //   })
  // );

  // You also have direct access to the Zustand store if necessary
  store.setState({ custom: 'custom state' });
}

await main();

app.innerHTML = `<pre>${JSON.stringify(store.getState(), null, 2)}</pre>`;
