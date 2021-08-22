import create, {
  StoreApi,
  GetState,
  SetState,
  Subscribe,
  Destroy,
  State,
  PartialState,
} from 'zustand/vanilla';

import {
  DrupalStateConfig,
  DsState,
  CollectionState,
  GenericIndex,
  CollectionResponse,
} from './types/interfaces';

import fetchApiIndex from './fetch/fetchApiIndex';
import fetchCollection from './fetch/fetchCollection';

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

  // Todo - Tests
  // Todo - Various error handling
  /**
   * Get the contents of the root API from local state if it exists, or fetch
   * it from Drupal if it doesn't exist in local state.
   * @returns a promise containing an index of api links
   */
  private async getApiIndex(): Promise<PartialState<State>> {
    // TODO: this should be optimized so we don't have create a full copy of
    // the store.
    const state = this.getState() as DsState;
    const dsApiIndex = state.dsApiIndex;

    if (!dsApiIndex) {
      // Fetch the API index from Drupal
      const dsApiIndexData = await fetchApiIndex(this.apiRoot);
      this.setState({ dsApiIndex: dsApiIndexData });

      const updatedState = this.getState() as DsState;
      return updatedState.dsApiIndex;
    }

    return dsApiIndex;
  }

  /**
   * Get an object from local state if it exists, or fetch it from Drupal if
   * it doesn't exist in local state.
   * @param objectName Name of object to retrieve. Ex: node--article
   * @returns a promise containing JSON:Api data for the requested object
   */
  async getObject(objectName: string): Promise<PartialState<State>> {
    const state = this.getState() as DsState;
    const objectState = state[objectName]?.data as PartialState<State>;

    if (!objectState) {
      const dsApiIndex = (await this.getApiIndex()) as GenericIndex;
      const endpoint = dsApiIndex[objectName];
      const objectData = await fetchCollection(endpoint);

      const objectState = {} as CollectionState;
      objectState[objectName] = objectData as CollectionResponse;

      this.setState(objectState);
      const updatedState = this.getState() as CollectionState;
      return updatedState[objectName].data;
    }

    return objectState;
  }
}

export default drupalState;
