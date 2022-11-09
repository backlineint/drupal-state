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
import { default as deepmerge } from 'deepmerge';

import fetchApiIndex from './fetch/fetchApiIndex';
import fetchJsonapiEndpoint from './fetch/fetchJsonapiEndpoint';
import translatePath from './fetch/translatePath';
import fetchToken from './fetch/fetchToken';

import defaultFetch from './fetch/defaultFetch';

import { TJsonApiBody, TJsonApiLinks } from 'jsona/lib/JsonaTypes';
import {
  keyedResources,
  TJsonApiBodyDataRequired,
  DrupalStateConfig,
  DsState,
  CollectionState,
  GenericIndex,
  GetObjectParams,
  GetObjectByPathParams,
  TokenObject,
  TokenResponseObject,
  dsPathTranslations,
  fetchAdapter,
  ResourceState,
  isGenericIndex,
} from './types/types';

class DrupalState {
  apiBase: string;
  apiPrefix: string;
  defaultLocale?: string;
  apiRoot: string;
  private clientId: string | undefined;
  private clientSecret: string | undefined;
  fetchAdapter?: fetchAdapter;
  auth: boolean;
  private token: TokenObject = {
    accessToken: '',
    validUntil: 0,
    tokenType: '',
  };
  debug: boolean;
  store: StoreApi<State>;
  getState: GetState<State>;
  setState: SetState<State>;
  subscribe: Subscribe<State>;
  destroy: Destroy;
  private dataFormatter: Jsona;
  // Custom error handler
  onError: (err: Error) => void;
  noStore: boolean;

  constructor({
    apiBase,
    apiPrefix = 'jsonapi',
    defaultLocale,
    clientId,
    clientSecret,
    fetchAdapter = defaultFetch,
    debug = false,
    onError,
    noStore = false,
  }: DrupalStateConfig) {
    this.apiBase = apiBase;
    this.apiPrefix = apiPrefix;
    this.defaultLocale = defaultLocale;
    this.apiRoot = this.assembleApiRoot();
    // TODO - .env support? Or should the consuming app be responsible for that?
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.auth = this.clientId && this.clientSecret ? true : false;
    this.fetchAdapter = fetchAdapter;
    this.debug = debug;
    this.dataFormatter = new Jsona();
    this.noStore = noStore;

    !this.debug || console.log('Debug mode:', debug);

    this.store = create(() => ({}));
    const { getState, setState, subscribe, destroy } = this.store;

    this.getState = getState;
    this.setState = setState;
    this.subscribe = subscribe;
    this.destroy = destroy;

    const defaultErrorHandler = (err: Error) => {
      throw err;
    };
    this.onError = onError || defaultErrorHandler;
  }

  /**
   * Format apiBase, apiPrefix, and combine into apiRoot.
   * @returns a fully qualified JSON:API root endpoint URL
   */
  assembleApiRoot(): string {
    // Format apiBase - ensure it doesn't have a trailing /
    this.apiBase = this.apiBase.replace(/\/\s*$/, '');
    // Format apiPrefix - ensure it doesn't have a leading / and does have a
    // trailing /
    this.apiPrefix = this.apiPrefix.replace(/^\s*\//, '');
    this.apiPrefix =
      this.apiPrefix.slice(-1) === '/' ? this.apiPrefix : `${this.apiPrefix}/`;

    if (this.defaultLocale) {
      return `${this.apiBase}/${this.defaultLocale}/${this.apiPrefix}`;
    } else {
      return `${this.apiBase}/${this.apiPrefix}`;
    }
  }

  // Todo - Various error handling
  /**
   * Assembles a correctly formatted JSON:API endpoint URL.
   * @param indexHref a JSON:API resource endpoint
   * @param id id of an individual resource
   * @param params user provided JSON:API parameter string or DrupalJsonApiParams object
   * @returns a full endpoint URL
   */
  assembleEndpoint(
    indexHref: string,
    id = '',
    params?: string | DrupalJsonApiParams
  ): string {
    const drupalJsonApiParams = new DrupalJsonApiParams();
    let endpoint = '';

    if (params) {
      if (typeof params === 'string' && params[0] === '?') {
        this.onError(
          new Error(
            `Invalid params: Params must not start with "?". \nRemove the preceding "?" or use https://www.npmjs.com/package/drupal-jsonapi-params`
          )
        );
        return '';
      } else {
        drupalJsonApiParams.initialize(params);
      }
    }

    // TODO - probably need some additional error handling here
    if (!isGenericIndex(indexHref) || !indexHref) {
      this.onError(
        new Error(
          `Could not assemble endpoint. Check the hrefIndex, and id.\napiBase: ${JSON.stringify(
            this.apiBase ?? null
          )}\nindex: ${JSON.stringify(indexHref) ?? null}\nid: ${id ?? null}`
        )
      );
      return '';
    }
    if (typeof indexHref === 'string') {
      endpoint = indexHref;
    }
    if (id) {
      endpoint += `/${id}`;
    }

    if (drupalJsonApiParams.getQueryString()) {
      endpoint += `?${drupalJsonApiParams.getQueryString()}`;
    }
    return endpoint;
  }

  /**
   * Assembles an authorization header using an existing token if valid, or by
   * fetching a new token if necessary.
   * @returns a string containing an authorization header value
   */
  async getAuthHeader(): Promise<string> {
    if (this.token.validUntil - 10 * 1000 > Date.now()) {
      !this.debug || console.log('Using existing auth token');
    } else {
      !this.debug || console.log('Fetching new auth token');
      const tokenRequestBody = {
        grant_type: 'client_credentials',
        client_id: this.clientId as string,
        client_secret: this.clientSecret as string,
      };
      const tokenResponse = (await fetchToken(
        `${this.apiBase}/oauth/token`,
        tokenRequestBody,
        this.fetchAdapter,
        this.onError
      )) as TokenResponseObject;
      this.token = {
        accessToken: tokenResponse.access_token,
        validUntil: Date.now() + tokenResponse.expires_in * 1000,
        tokenType: tokenResponse.token_type,
      };
    }
    return `${this.token.tokenType} ${this.token.accessToken}`;
  }

  /**
   * Wraps {@link fetch/fetchApiIndex} function so it can be overridden.
   */
  async fetchApiIndex(apiRoot: string): Promise<void | GenericIndex> {
    return await fetchApiIndex(apiRoot, this.fetchAdapter, this.onError);
  }
  /**
   *
   * Wraps {@link fetch/fetchJsonapiEndpoint} function so it can be overridden.
   */
  async fetchJsonapiEndpoint(
    endpoint: string,
    requestInit = {},
    onError: (err: Error) => void,
    res: ServerResponse | boolean
  ): Promise<void | Response> {
    return await fetchJsonapiEndpoint(
      endpoint,
      requestInit,
      onError,
      res,
      this.fetchAdapter
    );
  }

  /**
   * Fetches data using  our fetch method.
   * @param endpoint the assembled JSON:API endpoint
   * @param res response object
   * @param anon make the request anonymously if true
   * @returns data fetched from JSON:API endpoint
   */
  async fetchData(
    endpoint: string,
    res: ServerResponse | boolean = false,
    anon = false
  ): Promise<TJsonApiBody | void> {
    let requestInit = {};
    let authHeader = '';
    if (this.clientId && this.clientSecret && !anon) {
      const headers = new Headers();
      authHeader = await this.getAuthHeader();
      headers.append('Authorization', authHeader);
      requestInit = {
        headers: headers,
      };
    }
    return (await this.fetchJsonapiEndpoint(
      endpoint,
      requestInit,
      this.onError,
      res
    )) as TJsonApiBody;
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
      // TODO - consider adding this to the DrupalState class rather than adding
      // data that we rely on to the store.

      const updatedState = this.getState() as DsState;
      return updatedState.dsApiIndex as GenericIndex;
    }
    return dsApiIndex;
  }

  /**
   * Get an object by path alias from local state if it exists, or fetch it from Drupal
   * if it doesn't exist in local state.
   * @remarks The query option was experimental and is now deprecated
   * @param options.objectName - Name of object to retrieve.
   * @param options.path - Alias of a specific resource
   * @param options.res - response object
   * @param options.params - user provided JSON:API parameter string or DrupalJsonApiParams object
   * @param options.refresh - a boolean value. If true, ignore local state.
   * @param options.anon - a boolean value. If true, send the request without the authentication header if valid credentials exist.
   * @returns a promise containing deserialized JSON:API data for the requested
   * object
   *
   * @example
   * ```
   * await store.getObjectByPath({
   *    objectName: 'node--article',
   *    path: '/articles/my-article',
   *    res: ServerResponse,
   *    params: 'include=field_media_image',
   *    refresh: true,
   * )}
   * ```
   */
  async getObjectByPath({
    objectName,
    path,
    res,
    params,
    refresh = false,
    anon = false,
    query = false,
  }: GetObjectByPathParams): Promise<PartialState<State> | void> {
    if (query) {
      console.warn(
        `The \`query\` option is deprecated; Fetching without query...`
      );
    }
    const currentState = this.getState() as DsState;
    const dsPathTranslations = currentState.dsPathTranslations as GenericIndex;
    if (refresh || !dsPathTranslations?.[`${path}`] || this.noStore) {
      !this.debug ||
        console.log(
          `No match for ${path} in dsPathTranslations - calling translatePath.`
        );
      // TODO - abstract helper method to assemble requestInit and authHeader
      let requestInit = {};
      let authHeader = '';
      if (this.clientId && this.clientSecret && !anon) {
        const headers = new Headers();
        authHeader = await this.getAuthHeader();
        headers.append('Authorization', authHeader);
        requestInit = {
          headers: headers,
        };
      }
      const response = (await translatePath(
        this.apiBase + '/router/translate-path',
        path,
        requestInit,
        false,
        this.fetchAdapter,
        this.onError
      )) as TJsonApiBody;

      if (!response) {
        // If there is no response, return early
        // because `id` will be undefined later.
        return;
      } else {
        const pathTranslationsState =
          currentState.dsPathTranslations as GenericIndex;

        if (pathTranslationsState) {
          if (refresh && pathTranslationsState[`${path}`]) {
            // Remove old response so refreshed response can be used.
            delete pathTranslationsState[`${path}`];
          }
          // If dsPathTranslations exists in state, add the new path to it.
          const updatedPathTranslationState = {
            ...pathTranslationsState,
            [path]: response,
          } as dsPathTranslations;

          this.setState({
            ['dsPathTranslations']: updatedPathTranslationState,
          });
        } else {
          const newPathTranslationState = {
            [path]: response,
          };
          this.setState({ ['dsPathTranslations']: newPathTranslationState });
        }
      }
    }

    const updatedState = this.getState() as DsState;
    const pathTranslations =
      updatedState.dsPathTranslations as dsPathTranslations;
    const id = pathTranslations[`${path}`].entity.uuid;

    const object = await this.getObject({
      objectName,
      id,
      res,
      params,
      refresh,
      anon,
    });
    return object;
  }

  /**
   * Get an object from local state if it exists, or fetch it from Drupal if
   * it doesn't exist in local state.
   * @remarks The query option was experimental and is now deprecated
   * @param options.objectName - Name of object to fetch
   * @param options.id - id of a specific resource
   * @param options.res - response object
   * @param options.params - user provided JSON:API parameter string or DrupalJsonApiParams object
   * @param options.all - a boolean value. If true, fetch all objects in a collection.
   * @param options.refresh - a boolean value. If true, ignore local state.
   * @param options.anon - a boolean value. If true, send the request without the authentication header if valid credentials exist.
   * @returns a promise containing deserialized JSON:API data for the requested
   * object
   *
   * @example
   *    * @example
   * ```
   * await store.getObject({
   *    objectName: 'node--article',
   *    id: 'some-article-uuid-here',
   *    res: ServerResponse,
   *    params: 'include=field_media_image',
   *    refresh: true,
   * )}
   * ```
   */
  async getObject({
    objectName,
    id,
    res = false,
    params,
    all = false,
    refresh = false,
    anon = false,
    query = false,
  }: GetObjectParams): Promise<PartialState<State> | void> {
    if (query) {
      console.warn(
        `The \`query\` option is deprecated; Fetching without query...`
      );
    }

    if (
      params !== undefined &&
      typeof params !== 'string' &&
      !(params instanceof DrupalJsonApiParams)
    ) {
      this.onError(
        new Error(
          `Invalid params: Params must be a string or instance of DrupalJsonApiParams (https://www.npmjs.com/package/drupal-jsonapi-params)`
        )
      );
      return;
    }

    const apiErr = new Error(
      `Unable to fetch the API Index.\nCheck that ${this.apiRoot} is a valid jsonapi index`
    );
    const objNameErr = new Error(
      `Invalid objectName.\nCheck that ${objectName} is a valid node in your Drupal instance`
    );

    const state = this.getState() as DsState;
    const paramString =
      typeof params === 'string' ? params : params?.getQueryString();
    // The collectionKey is used to index a collection in state
    const collectionKey = paramString
      ? `${objectName}-${paramString}`
      : objectName;
    const resourceKey = `${objectName}Resources`;
    // Check for collection in the store
    const collectionState = state[collectionKey] as TJsonApiBodyDataRequired;

    if (this.noStore && !all) {
      !this.debug || console.log(`Fetch Resource ${objectName}`);
      const dsApiIndex = (await this.getApiIndex()) as GenericIndex;
      if (!dsApiIndex) {
        this.onError(apiErr);
        return;
      }

      if (!dsApiIndex[objectName]) {
        this.onError(objNameErr);
        return;
      }
      const endpoint = this.assembleEndpoint(
        (dsApiIndex[objectName] as GenericIndex).href as string,
        id,
        params
      );

      const resourceData = (await this.fetchData(
        endpoint,
        res,
        anon
      )) as keyedResources;

      return this.dataFormatter.deserialize(resourceData);
    }

    // If an id is provided, find and return a resource
    if (id) {
      const resourceId = paramString ? `${id}-${paramString}` : id;

      const resourceState = !refresh
        ? (state[resourceKey] as keyedResources)
        : false;

      // If requested resource is in the resource store, return that
      if (resourceState) {
        const resource = resourceState[resourceId] as keyedResources;
        if (resource) {
          !this.debug || console.log(`Matched resource ${id} in state`);
          return resource?.graphql
            ? resource.graphql
            : this.dataFormatter.deserialize(resource);
        }
      }

      // If requested resource is in the collection store, return that
      if (collectionState?.data && !refresh) {
        // If the collection is in the store, check for the resource
        const matchedResourceState = collectionState.data.filter(item => {
          return item['id'] === id;
        });

        // If resource already exists within collection, return that.
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
      if (!dsApiIndex) {
        this.onError(apiErr);
        return;
      }

      if (!dsApiIndex[objectName]) {
        this.onError(objNameErr);
        return;
      }
      const endpoint = this.assembleEndpoint(
        (dsApiIndex[objectName] as GenericIndex).href as string,
        id,
        params
      );

      const resourceData = (await this.fetchData(
        endpoint,
        res,
        anon
      )) as keyedResources;

      const objectResourceState = state[resourceKey];

      if (objectResourceState) {
        // If the resource state exists, add the new resource to it.
        const updatedResourceState = {
          ...objectResourceState,
          [resourceId]: resourceData,
        };

        this.setState({
          [resourceKey]: updatedResourceState,
        });
      } else {
        const newResourceState = {
          [resourceId]: resourceData,
        };

        this.setState({ [resourceKey]: newResourceState });
      }

      return this.dataFormatter.deserialize(resourceData);
    } // End if (id) block

    if (
      refresh ||
      !collectionState ||
      (collectionState.links?.next && !collectionState.links?.last && all) ||
      this.noStore
    ) {
      this.debug &&
        !this.noStore &&
        console.log(`Fetch Collection ${objectName} and add to state`);
      const dsApiIndex = (await this.getApiIndex()) as GenericIndex;

      if (!dsApiIndex) {
        this.onError(apiErr);
        return;
      }

      if (!dsApiIndex[objectName]) {
        this.onError(objNameErr);
        return;
      }
      const endpoint = this.assembleEndpoint(
        (dsApiIndex[objectName] as GenericIndex).href as string,
        id,
        params
      );

      const collectionData = (await this.fetchData(
        endpoint,
        res,
        anon
      )) as keyedResources;

      this.debug &&
        !this.noStore &&
        console.log(`Add Collection ${objectName} to state`);
      const fetchedCollectionState = {} as CollectionState;
      fetchedCollectionState[collectionKey] = collectionData;

      this.setState(fetchedCollectionState);

      // if the all flag is present
      // and if there is a next page
      // aka >50 items available,
      // fetch them and add to store
      if (all) {
        let links = collectionData?.links as TJsonApiLinks;
        // the shape of { links } is not consistent so normalize it here
        const normalizeNextLink = (linkObj: TJsonApiLinks): string => {
          // There is a likely a better way to narrow this type...
          if (linkObj === undefined || !('next' in linkObj)) {
            return '';
          } else if ('next' in linkObj && typeof linkObj.next === 'string') {
            return linkObj.next;
            //TODO: type predicate for next link
          } else if (
            linkObj.next !== null &&
            linkObj.next !== undefined &&
            typeof linkObj.next !== 'string' &&
            'href' in linkObj?.next &&
            typeof linkObj.next.href === 'string'
          ) {
            return linkObj.next.href;
          }
          return '';
        };
        const nextLink = normalizeNextLink(links);

        if (nextLink) {
          !this.debug ||
            console.log(
              `Found 'next' link - attempting to fetch next page of results for ${objectName}`
            );

          // helper function to fetch and add next page's data to the store
          const getNextPage = async (nextPageEndpoint: string) => {
            if (nextPageEndpoint === '') return {} as TJsonApiLinks;
            const nextPage = (await this.fetchData(
              nextPageEndpoint,
              res
            )) as keyedResources;

            const currentState = this.getState() as CollectionState;
            // using deepmerge to merge arrays instead of overwriting them
            const mergedCollection: keyedResources = deepmerge(
              currentState[collectionKey],
              nextPage
            );

            currentState[collectionKey] = mergedCollection;
            this.setState(currentState);

            return nextPage.links as TJsonApiLinks;
          };
          let nextPageEndpoint = nextLink;
          // if current page has a next page, get that data too
          let results;
          do {
            const currentLinks = await getNextPage(nextPageEndpoint);
            results = this.getState() as ResourceState;
            links = currentLinks;
            const nextLink = normalizeNextLink(currentLinks);
            nextPageEndpoint = nextLink;
          } while (links.next);
          const allPagesCollectionData = results[collectionKey];

          if (this.noStore) {
            delete results[collectionKey];
          }
          return this.dataFormatter.deserialize(allPagesCollectionData);
        }
      }

      return this.dataFormatter.deserialize(collectionData);
    } else {
      !this.debug || console.log(`Matched collection ${objectName} in state`);
      return this.dataFormatter.deserialize(collectionState);
    }
  }
}

export default DrupalState;
