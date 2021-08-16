import create, {
  StoreApi,
  GetState,
  SetState,
  Subscribe,
  Destroy,
  State,
  PartialState,
} from 'zustand/vanilla';

interface DrupalStateConfig {
  apiRoot: string;
}

class drupalState {
  apiRoot: string;
  store: StoreApi<State>;
  getState: GetState<State>;
  setState: SetState<State>;
  subscribe: Subscribe<State>;
  destroy: Destroy;

  constructor({ apiRoot }: DrupalStateConfig) {
    this.apiRoot = apiRoot ? apiRoot : '';

    this.store = create(() => ({}));
    const { getState, setState, subscribe, destroy } = this.store;

    this.getState = getState;
    this.setState = setState;
    this.subscribe = subscribe;
    this.destroy = destroy;
  }

  // Docs
  // Tests
  // Write tests along the way...
  // Some utils here for sure
  /**
   * getObject
   * ** If no local state, fetch it.
   * * Check state for dsApiIndex
   * ** Returns local state if it exists
   * ** If it doesn't, fetch apiIndex and store in state
   * * Get link from apiIndex
   * * Fetch that link
   * * Store in state
   * * Return state
   * * Various error handling
   */

  /**
   * Get an object from local state if it exists, or fetch it from Drupal if
   * it doesn't exist in local state.
   * @param objectName Name of object to retrieve. Ex: node--article
   */
  getObject(objectName: string): PartialState<State> {
    const objectState = this.getState()[objectName] as PartialState<State>;
    if (!objectState) {
      console.log('No match');
      // Pick up - fetch the requested object from Drupal
      // Check for a dsApiIndex...
    }

    return objectState;
  }
}

export default drupalState;
