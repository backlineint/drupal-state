import create from 'zustand/vanilla';

interface DrupalStateConfig {
  apiRoot: string;
}

// TODO - Correctly type all of this once model settles.
class drupalState {
  apiRoot: string;
  store: any;
  getState: any;
  setState: any;
  subscribe: any;
  destroy: any;

  constructor({ apiRoot }: DrupalStateConfig) {
    this.apiRoot = apiRoot ? apiRoot : '';

    this.store = create(() => ({}));
    const { getState, setState, subscribe, destroy } = this.store;

    this.getState = getState;
    this.setState = setState;
    this.subscribe = subscribe;
    this.destroy = destroy;
  }
}

export default drupalState;
