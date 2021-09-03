import drupalState from './drupalState';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!;

const store: any = new drupalState({
  apiRoot: 'https://live-contentacms.pantheonsite.io/api',
  debug: true,
});

async function main(): Promise<void> {
  // If no resources are in state, create a new resource object
  await store.getObject('recipes', 'a542e833-edfe-44a3-a6f1-7358b115af4b');
  // If a resource is in state, use the local version rather than fetching
  await store.getObject('recipes', 'a542e833-edfe-44a3-a6f1-7358b115af4b');

  // Fetch and add to the existing resource object
  await store.getObject('recipes', '84cfaa18-faca-471f-bfa5-fbb8c199d039');
  // If a resource is in state, use the local version rather than fetching
  await store.getObject('recipes', '84cfaa18-faca-471f-bfa5-fbb8c199d039');

  // Fetch a collection
  await store.getObject('recipes');
  // Get collection from state if it already exists
  await store.getObject('recipes');

  // If a resource exists in collection state, use that
  await store.getObject('recipes', '1c134a16-01ab-4133-ae1f-6e078fe1f64b');

  // You also have direct access to the Zustand store if necessary
  store.setState({ custom: 'custom state' });
}

await main();

app.innerHTML = `<pre>${JSON.stringify(store.getState(), null, 2)}</pre>`;
