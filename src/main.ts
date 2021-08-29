import drupalState from './drupalState';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!;

const store: any = new drupalState({
  apiRoot: 'https://live-contentacms.pantheonsite.io/api',
});

store.setState({ custom: 'custom state' });

// The first getObject below will fetch from JSON:API but the second will
// retrieve from local state.
// await store.getObject('recipes');
// await store.getObject('recipes');
console.log(
  'Get Object with an ID',
  await store.getObject('recipes', 'a542e833-edfe-44a3-a6f1-7358b115af4b')
);

app.innerHTML = `<pre>${JSON.stringify(store.getState(), null, 2)}</pre>`;
