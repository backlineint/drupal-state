import create from 'zustand/vanilla'

// TODO - Correctly type all of this once model settles.
class drupalState {
  store: any;
  getState: any;
  setState: any;
  subscribe: any;
  destroy: any;

  constructor() {
    this.store = create(() => ({}));
    const { getState, setState, subscribe, destroy } = this.store;
    this.getState = getState;
    this.setState = setState;
    this.subscribe = subscribe;
    this.destroy = destroy;
  }
}

export default drupalState;