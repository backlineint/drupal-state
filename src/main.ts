import DrupalState from './DrupalState';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!;

const store: DrupalState = new DrupalState({
  apiBase: 'https://dev-ds-demo.pantheonsite.io/',
  apiPrefix: 'jsonapi',
  defaultLocale: 'en',
  debug: true,
  // Example custom error handler
  // onError: err => {
  //   // if there is a status code it will be at the end of the error message
  //   const [statusCode] = err?.message?.match(/([0-5]{3})$/gm) || [null];
  //   let renderErr;
  //   if (statusCode === '404') {
  //     renderErr = `<h2>${err.message}</h2>`;
  //   } else if (statusCode === '500') {
  //     renderErr = `<h2>Something went wrong. Please try again later!</h2>`;
  //   } else {
  //     renderErr = `<pre>${JSON.stringify(err.message ? err.message : err, null, 2)}<pre>`;
  //   }
  //   // set error and statusCode to global state
  //   store.setState({ error: err, statusCode: statusCode });
  //   app.innerHTML += renderErr + '<br>';
  //   return;
  // },
});

// Uncomment to use authenticated store - currently depends on local environment
// const authStore: any = new DrupalState({
//   apiBase: 'https://demo-decoupled-bridge.lndo.site',
//   apiPrefix: 'jsonapi',
//   defaultLocale: 'en',
//   clientId: 'my-client-id',
//   clientSecret: 'mysecret',
//   debug: true,
//   onError: (err: Error) => {
//     console.log("An exception was caught!!!")
//     console.error(err)
//   }
// });

async function main(): Promise<void> {
  // Include images in response
  store.params.addInclude(['field_media_image']);

  console.log(
    '--- If no resources are in state, create a new resource object ---'
  );
  console.log(
    await store.getObject({
      objectName: 'node--recipe',
      id: '33386d32-a87c-44b9-b66b-3dd0bfc38dca',
    })
  );
  console.log(
    '--- If a resource is in state, use the local version rather than fetching ---'
  );
  console.log(
    await store.getObject({
      objectName: 'node--recipe',
      id: '33386d32-a87c-44b9-b66b-3dd0bfc38dca',
    })
  );

  console.log('--- Fetch and add to the existing resource object ---');
  console.log(
    await store.getObject({
      objectName: 'node--recipe',
      id: '50c3e7c9-64a9-453c-9289-278132beb4a2',
    })
  );
  console.log(
    '--- If a resource is in state, use the local version rather than fetching ---'
  );
  console.log(
    await store.getObject({
      objectName: 'node--recipe',
      id: '50c3e7c9-64a9-453c-9289-278132beb4a2',
    })
  );

  console.log('--- Fetch a collection ---');
  console.log(
    await store.getObject({
      objectName: 'node--recipe',
    })
  );

  console.log('--- Get collection from state if it already exists ---');
  console.log(
    await store.getObject({
      objectName: 'node--recipe',
    })
  );
  console.log('--- If a resource exists in collection state, use that ---');
  console.log(
    await store.getObject({
      objectName: 'node--recipe',
      id: '21a95a3d-4a83-494f-b7b4-dcfb0f164a74',
    })
  );

  console.log('--- Fetch a resource with a query ---');
  // Note: query based resources can't be retrieved from collection state because
  // the query may not contain the ID.
  console.log(
    await store.getObject({
      objectName: 'node--recipe',
      id: 'da1359f4-2e60-462c-8909-47c3bce11fdf',
      query: `{
        title
        difficulty
        id
      }`,
    })
  );
  store.params.clear(); // Remove image field include as it does not exist on pages
  console.log(
    '--- Fetch a resource with a query from state if it already exists ---'
  );
  console.log(
    await store.getObject({
      objectName: 'node--recipe',
      id: 'da1359f4-2e60-462c-8909-47c3bce11fdf',
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
      objectName: 'node--page',
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
      objectName: 'node--page',
      query: `{
        title
        id
      }`,
    })
  );

  // gets the first 50 results only
  console.log('--- Fetch objects of a type ---');
  console.log(
    await store.getObject({
      objectName: 'node--ds_example',
    })
  );
  // get the remaining results
  console.log('--- Fetch _all_ objects of a type ---');
  console.log(
    await store.getObject({
      objectName: 'node--ds_example',
      all: true,
    })
  );

  console.log('--- Fetch _all_ objects of a type with a query---');
  console.log(
    await store.getObject({
      objectName: 'node--ds_example',
      all: true,
      query: `{
        title
        id
      }`,
    })
  );

  console.log('-- Ignore the store and force fetch data from Drupal --');
  console.log(
    await store.getObject({
      objectName: 'node--recipe',
      id: '50c3e7c9-64a9-453c-9289-278132beb4a2',
      refresh: true,
    })
  );

  // It is possible to fetch menu data using the jsonapi_menu_items module along with jsonapi_hypermedia
  // jsonapi_hypermedia module: https://www.drupal.org/project/jsonapi_hypermedia
  // jsonapi_menu_items module: https://www.drupal.org/project/jsonapi_menu_items
  console.log('--- Fetch Menu items---');
  console.log(await store.getObject({ objectName: 'menu_items--main' }));

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
