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
  CollectionData,
  ResourceState,
} from './types/interfaces';

import { keyedResources } from './types/types';

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
    this.apiRoot = apiRoot;

    this.store = create(() => ({}));
    const { getState, setState, subscribe, destroy } = this.store;

    this.getState = getState;
    this.setState = setState;
    this.subscribe = subscribe;
    this.destroy = destroy;
  }

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
  async getObject(
    objectName: string,
    id?: string
  ): Promise<PartialState<State>> {
    const state = this.getState() as DsState;
    // Check for collection in the store
    const collectionState = state[objectName]?.data as CollectionData;

    // If an id is provided, find and return a resource
    if (id) {
      // If the collection is in the store, check for the resource
      if (collectionState) {
        const resourceState = collectionState.filter(item => {
          return item['id'] === id;
        });

        // Resource already exists within collection, return that.
        if (resourceState) {
          return resourceState.pop();
        }
        // TODO - also check in resource store
      } else {
        // If the resource is not in the store, fetch it from Drupal
        const dsApiIndex = (await this.getApiIndex()) as GenericIndex;
        const endpoint: string = dsApiIndex[objectName];
        const collectionData = (await fetchCollection(
          `${endpoint}/${id}`
        )) as CollectionResponse;

        // Pick up - Handle case where resource state already exists
        // check state first/test with existing resource state.
        // Check in resource store in addition to collection store.
        // continue renaming and refining types.

        const resourceArray: keyedResources = {};
        resourceArray[id] = collectionData;

        // Pick up
        const fetchedResourceState = {} as ResourceState;
        fetchedResourceState[`${objectName}Resources`] = resourceArray;
        this.setState(fetchedResourceState);

        return collectionData.data;
      }
      // Need some way to force a fetch.
      // Need a way to provide a name for the collection / resource
    }

    if (!collectionState) {
      const dsApiIndex = (await this.getApiIndex()) as GenericIndex;
      const endpoint: string = dsApiIndex[objectName];
      const collectionData = (await fetchCollection(
        endpoint
      )) as CollectionResponse;

      const fetchedCollectionState = {} as CollectionState;
      fetchedCollectionState[objectName] = collectionData;

      this.setState(fetchedCollectionState);
      const updatedState = this.getState() as DsState;
      return updatedState[objectName].data as CollectionData;
    }

    return collectionState;
  }
}

export default drupalState;
