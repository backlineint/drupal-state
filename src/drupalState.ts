import create, {
  StoreApi,
  GetState,
  SetState,
  Subscribe,
  Destroy,
  State,
  PartialState,
} from 'zustand/vanilla';

import fetchApiIndex from './fetch/fetchApiIndex';

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
   * * Get link from apiIndex
   * * Fetch that link
   * * Store in state
   * * Return state
   * * Various error handling
   */

  /**
   * Get the contents of the root API from local state if it exists, or fetch
   * it from Drupal if it doesn't exist in local state.
   * @returns an index of api links
   */
  private async getApiIndex(): Promise<PartialState<State>> {
    // TODO: fix type warning.
    const dsApiIndex = this.getState().dsApiIndex as PartialState<State>;
    if (!dsApiIndex) {
      // Fetch the API index from Drupal
      const dsApiIndexData = await fetchApiIndex(this.apiRoot);
      this.setState({ dsApiIndex: dsApiIndexData });
      return this.getState().dsApiIndex;
    }

    return dsApiIndex;
  }

  /**
   * Get an object from local state if it exists, or fetch it from Drupal if
   * it doesn't exist in local state.
   * @param objectName Name of object to retrieve. Ex: node--article
   * @returns JSON:Api data for the requested object
   */
  async getObject(objectName: string): Promise<PartialState<State>> {
    // TODO: fix type warning.
    const objectState = this.getState()[objectName] as PartialState<State>;
    if (!objectState) {
      const dsApiIndex = await this.getApiIndex();
      console.log("dsApiIndex", dsApiIndex);
      // Pick up - getApiPath function
      // Fetch the requested object from Drupal using API Path
    }

    return objectState;
  }

}

export default drupalState;
