import { ServerResponse } from 'http';
import create, {
  StoreApi,
  GetState,
  SetState,
  Subscribe,
  Destroy,
  State,
  PartialState,
} from 'zustand/vanilla';
import Jsona from 'jsona';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';

import fetchApiIndex from './fetch/fetchApiIndex';
import fetchJsonapiEndpoint from './fetch/fetchJsonapiEndpoint';

import { TJsonApiBody } from 'jsona/lib/JsonaTypes';
import {
  keyedResources,
  TJsonApiBodyDataRequired,
  DrupalStateConfig,
  DsState,
  CollectionState,
  GenericIndex,
  GetObjectParams,
} from './types/types';

class DrupalState {
  apiRoot: string;
  debug: boolean;
  store: StoreApi<State>;
  getState: GetState<State>;
  setState: SetState<State>;
  subscribe: Subscribe<State>;
  destroy: Destroy;
  private dataFormatter: Jsona;
  /**
   * DrupalJsonApiParams - see [https://www.npmjs.com/package/drupal-jsonapi-params](https://www.npmjs.com/package/drupal-jsonapi-params)
   */
  params: DrupalJsonApiParams;

  constructor({ apiRoot, debug = false }: DrupalStateConfig) {
    this.apiRoot = apiRoot;
    this.debug = debug;
    this.dataFormatter = new Jsona();
    this.params = new DrupalJsonApiParams();

    !this.debug || console.log('Debug mode:', debug);

    this.store = create(() => ({}));
    const { getState, setState, subscribe, destroy } = this.store;

    this.getState = getState;
    this.setState = setState;
    this.subscribe = subscribe;
    this.destroy = destroy;
  }

  // Todo - Various error handling
  /**
   * Assembles a correctly formatted JSON:API endpoint URL.
   * @param index a JSON:API resource endpoint
   * @param query query string containing JSON:API parameters
   * @param id id of an individual resource
   */
  assembleEndpoint(
    index: string | GenericIndex,
    query: string,
    id = ''
  ): string {
    let endpoint = '';
    if (typeof index === 'string') {
      endpoint = index;
    } else {
      // TODO - probably need some additional error handling here
      endpoint = index.href as string;
    }
    if (id) {
      endpoint += `/${id}`;
    }
    if (query) {
      endpoint += `?${query}`;
    }
    return endpoint;
  }

  /**
   * Wraps {@link fetch/fetchApiIndex} function so it can be overridden.
   */
  async fetchApiIndex(apiRoot: string): Promise<void | GenericIndex> {
    return await fetchApiIndex(apiRoot);
  }

  /**
   *
   * Wraps {@link fetch/fetchJsonapiEndpoint} function so it can be overridden.
   */
  async fetchJsonapiEndpoint(
    endpoint: string,
    res: ServerResponse | boolean
  ): Promise<void | TJsonApiBody> {
    return await fetchJsonapiEndpoint(endpoint, res);
  }

  /**
   * Get the contents of the root API from local state if it exists, or fetch
   * it from Drupal if it doesn't exist in local state.
   * @returns a promise containing an index of api links
   */
  private async getApiIndex(): Promise<PartialState<State>> {
    // TODO: this should be optimized so we don't have create a full copy of
    // the store.
    const state = this.getState() as DsState;
    const dsApiIndex = state.dsApiIndex as GenericIndex;

    if (!dsApiIndex) {
      // Fetch the API index from Drupal
      const dsApiIndexData = await this.fetchApiIndex(this.apiRoot);
      this.setState({ dsApiIndex: dsApiIndexData });

      const updatedState = this.getState() as DsState;
      return updatedState.dsApiIndex as GenericIndex;
    }

    return dsApiIndex;
  }

  /**
   * Get an object from local state if it exists, or fetch it from Drupal if
   * it doesn't exist in local state.
   * @param objectName Name of object to retrieve. Ex: node--article
   * @param id id of a specific resource
   * @param res response object
   * @returns a promise containing deserialized JSON:API data for the requested
   * object
   */
  async getObject({
    objectName,
    id,
    res = false,
  }: GetObjectParams): Promise<PartialState<State>> {
    const state = this.getState() as DsState;
    // Check for collection in the store
    const collectionState = state[objectName] as TJsonApiBodyDataRequired;

    // If an id is provided, find and return a resource
    if (id) {
      const resourceState = state[`${objectName}Resources`] as keyedResources;

      // If requested resource is in the resource store, return that
      if (resourceState) {
        const resource = resourceState[id];
        if (resource) {
          !this.debug || console.log(`Matched resource ${id} in state`);
          return this.dataFormatter.deserialize(resource);
        }
      }

      // If requested resource is in the collection store, return that
      if (collectionState?.data) {
        // If the collection is in the store, check for the resource
        const matchedResourceState = collectionState.data.filter(item => {
          return item['id'] === id;
        });

        // Resource already exists within collection, return that.
        if (matchedResourceState) {
          !this.debug || console.log(`Matched resource ${id} in collection`);
          // Should this be added to ResourceState as well?
          const serializedState = { data: matchedResourceState.pop() };
          return this.dataFormatter.deserialize(serializedState);
        }
      }
      // Resource isn't in state, so fetch it from Drupal
      !this.debug || console.log(`Fetch Resource ${id} and add to state`);
      const dsApiIndex = (await this.getApiIndex()) as GenericIndex;
      const endpoint = this.assembleEndpoint(
        dsApiIndex[objectName],
        this.params.getQueryString(),
        id
      );

      const resourceData = (await this.fetchJsonapiEndpoint(
        endpoint,
        res
      )) as TJsonApiBody;

      const objectResourceState = state[`${objectName}Resources`];

      if (objectResourceState) {
        // If the resource state exists, add the new resource to it.
        const updatedResourceState = {
          ...objectResourceState,
          [id]: resourceData,
        };

        this.setState({
          [`${objectName}Resources`]: updatedResourceState,
        });
      } else {
        const newResourceState = {
          [id]: resourceData,
        };

        this.setState({ [`${objectName}Resources`]: newResourceState });
      }

      return this.dataFormatter.deserialize(resourceData);
    } // End if (id) block

    if (!collectionState) {
      !this.debug ||
        console.log(`Fetch Collection ${objectName} and add to state`);
      const dsApiIndex = (await this.getApiIndex()) as GenericIndex;
      const endpoint = this.assembleEndpoint(
        dsApiIndex[objectName],
        this.params.getQueryString(),
        id
      );
      const collectionData = (await this.fetchJsonapiEndpoint(
        endpoint,
        res
      )) as TJsonApiBody;

      const fetchedCollectionState = {} as CollectionState;
      fetchedCollectionState[objectName] = collectionData;

      this.setState(fetchedCollectionState);
      const updatedState = this.getState() as DsState;
      return this.dataFormatter.deserialize(updatedState[objectName]);
    } else {
      !this.debug || console.log(`Matched collection ${objectName} in state`);
      return this.dataFormatter.deserialize(collectionState);
    }
  }
}

export default DrupalState;
