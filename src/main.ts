import drupalState from './drupalState';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!;

const blueState: any = new drupalState({
  apiRoot: 'https://live-contentacms.pantheonsite.io/api',
});

blueState.setState({ custom: 'custom state' });

// The first getObject below will fetch from JSON:API but the second will
// retrieve from local state.
await blueState.getObject('recipes');
await blueState.getObject('recipes');

app.innerHTML = `<pre>${JSON.stringify(blueState.getState(), null, 2)}</pre>`;
