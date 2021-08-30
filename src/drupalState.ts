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
      const resourceState = state[`${objectName}Resources`] as keyedResources;

      // If requested resource is in the resource store, return that
      if (resourceState) {
        const resource = resourceState[id];
        if (resource) {
          console.log(`Matched resource ${id} in state`);
          return resource;
        }
      }

      // If requested resource is in the collection store, return that
      if (collectionState) {
        // If the collection is in the store, check for the resource
        const matchedResourceState = collectionState.filter(item => {
          return item['id'] === id;
        });

        // Resource already exists within collection, return that.
        if (matchedResourceState) {
          console.log(`Matched resource ${id} in collection`);
          // TODO: Should this be added to ResourceState as well?
          return matchedResourceState.pop();
        }
      }
      // Resource isn't in state, so fetch it from Drupal
      console.log(`Fetch Resource ${id} and add to state`);
      const dsApiIndex = (await this.getApiIndex()) as GenericIndex;
      const endpoint: string = dsApiIndex[objectName];
      const collectionData = (await fetchCollection(
        `${endpoint}/${id}`
      )) as CollectionResponse;

      // Pick up - fix types
      // Debug Mode
      // continue renaming and refining types.
      // Tests and docs are needed.

      const objectResourceState = state[`${objectName}Resources`];

      if (objectResourceState) {
        // If the resource state exists, add the new resource to it.
        const updatedResourceState = {
          ...objectResourceState,
          [id]: collectionData.data,
        };

        this.setState({
          [`${objectName}Resources`]: updatedResourceState,
        });
      } else {
        // Create new object resource state with this resource included
        const resourceArray: keyedResources = {};
        resourceArray[id] = collectionData;

        const fetchedResourceState = {} as ResourceState;
        fetchedResourceState[`${objectName}Resources`] = resourceArray;
        this.setState(fetchedResourceState);
      }

      return collectionData.data;

      // Need some way to force a fetch.
      // Need a way to provide a name for the collection / resource
    } // End if (id) block

    if (!collectionState) {
      console.log(`Fetch Collection ${objectName} and add to state`);
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
    } else {
      console.log(`Matched collection ${objectName} in state`);
      return collectionState;
    }
  }
}

export default drupalState;
