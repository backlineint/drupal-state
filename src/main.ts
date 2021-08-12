import create from 'zustand/vanilla'
import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!

const response = await fetch(`https://live-contentacms.pantheonsite.io/api/recipes`)
  .then(async (response) => {
    return await response.json();
  });

/**
 * Next:
 * POC with nested Web components - parent that manages state and then 
 * a slot that renders another web component that uses that data. 
 * Something like https://apolloelements.dev/
 * experiment with subscrube and destroy
 * Define non-web component API would look like
 */

const store = create(() => ({ response }));
const { getState, setState, subscribe, destroy } = store;

setState({ custom: "custom state"});

app.innerHTML = `<pre>${JSON.stringify(getState(), null, 2)}</pre>`;