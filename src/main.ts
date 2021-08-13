import drupalState from './drupalState';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!

const blueState: any = new drupalState();

const response = await fetch(`https://live-contentacms.pantheonsite.io/api/recipes`)
  .then(async (response) => {
    return await response.json();
  });

blueState.setState({ response });
// This is a Zustand store, and you an also add your own custom state.
blueState.setState({ custom: "custom state" });

/**
 * Next:
 * Define non-web component API would look like
 * POC with nested Web components - parent that manages state and then 
 * a slot that renders another web component that uses that data. 
 * Something like https://apolloelements.dev/
 * experiment with subscribe and destroy
 * Define non-web component API would look like
 */

app.innerHTML = `<pre>${JSON.stringify(blueState.getState(), null, 2)}</pre>`;