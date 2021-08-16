import drupalState from './drupalState';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!;

const blueState: any = new drupalState({
  apiRoot: 'https://live-contentacms.pantheonsite.io/api',
});

const response = await fetch(blueState.apiRoot).then(async response => {
  return await response.json();
});

blueState.setState({ response });
// This is a Zustand store, and you an also add your own custom state.
blueState.setState({ custom: 'custom state' });

blueState.getObject('custom');

app.innerHTML = `<pre>${JSON.stringify(blueState.getState(), null, 2)}</pre>`;
