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
import { JsonApiLink } from 'apollo-link-json-api';
import {
  ApolloClient,
  gql,
  InMemoryCache,
  ApolloLink,
} from '@apollo/client/core';
import Jsona from 'jsona';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import { camelize } from 'humps';
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
  IterableDefinitionNode,
  jsonapiLinkObject,
  TokenObject,
  TokenResponseObject,
  ApolloClientWithHeaders,
  dsPathTranslations,
  fetchAdapter,
  ResourceState,
  queryResponse,
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
  client: ApolloClientWithHeaders;
  private dataFormatter: Jsona;
  // Custom error handler
  onError: (err: Error) => void;

  constructor({
    apiBase,
    apiPrefix = 'jsonapi',
    defaultLocale,
    clientId,
    clientSecret,
    fetchAdapter = defaultFetch,
    debug = false,
    onError,
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

    !this.debug || console.log('Debug mode:', debug);

    this.store = create(() => ({}));
    const { getState, setState, subscribe, destroy } = this.store;

    this.getState = getState;
    this.setState = setState;
    this.subscribe = subscribe;
    this.destroy = destroy;

    // TODO - fix JsonApiLink type defs - unknown feels like a hack.
    const jsonApiLink = new JsonApiLink({
      uri: this.apiRoot,
      customFetch: this.fetchAdapter,
    }) as unknown as ApolloLink;

    this.client = new ApolloClient({
      link: jsonApiLink,
      cache: new InMemoryCache(),
    }) as ApolloClientWithHeaders;

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
   * @param objectName - The resource type we're fetching.
   * @param index a JSON:API resource endpoint
   * @param id id of an individual resource
   * @param params user provided JSON:API parameter string or DrupalJsonApiParams object
   * @param query user provided GraphQL query
   * @returns a full endpoint URL or a relative endpoint URL is a query is provided
   */
  assembleEndpoint(
    objectName: string,
    index: string | GenericIndex,
    id = '',
    params?: string | DrupalJsonApiParams,
    query?: string | boolean
  ): string {
    const drupalJsonApiParams = new DrupalJsonApiParams();
    let endpoint = '';

    if (params) {
      if (typeof params === 'string' && params[0] === '?') {
        this.onError(new Error(`Do not start params string with "?".`));
        return '';
      } else {
        drupalJsonApiParams.initialize(params);
      }
    }

    // TODO - probably need some additional error handling here
    if (!index || index === undefined || typeof index === undefined) {
      this.onError(
        new Error(
          `Could not assemble endpoint. Check the index, object name, and id.\n\tapiBase:\n\tindex: ${JSON.stringify(
            index
          )}\n\tid: ${id}\n\tobjectName: ${objectName}`
        )
      );
      return '';
    }
    if (typeof index === 'string') {
      endpoint = index;
    } else {
      endpoint = index.href as string;
    }
    if (id) {
      endpoint += `/${id}`;
    }

    if (query) {
      // if a query exists we don't want the apiBase on the endpoint
      // as it will make the gqlQuery in conditionalFetch fail
      endpoint = endpoint.replace(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `${this.apiBase}${`/${this.defaultLocale}` || ''}/${this.apiPrefix}`,
        ''
      );

      const fields: string[] = [];
      const gqlObject = gql(query as string);

      gqlObject.definitions.forEach(definition => {
        const iterableDefinitions = definition as IterableDefinitionNode;
        iterableDefinitions.selectionSet.selections.forEach(selection => {
          if (selection.kind === 'Field') {
            fields.push(selection.name.value);
          }
        });
      });

      drupalJsonApiParams.addFields(objectName, fields);

      // Check here to make sure apiRoot has trailing slash?
      endpoint = endpoint.replace(this.apiRoot, '');
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
   * If a query is provided, fetches data using apollo-link-json-api, otherwise uses our fetch method.
   * @param endpoint the assembled JSON:API endpoint
   * @param query the specified GraphQL query
   * @param objectName Name of object to retrieve. Ex: node--article
   * @param res response object
   * @returns data fetched from JSON:API endpoint
   */
  async conditionalFetch(
    endpoint: string,
    query: string | boolean = false,
    objectName: string | boolean = false,
    res: ServerResponse | boolean = false
  ): Promise<TJsonApiBody | queryResponse | void> {
    let requestInit = {};
    let authHeader = '';
    if (this.clientId && this.clientSecret) {
      const headers = new Headers();
      authHeader = await this.getAuthHeader();
      headers.append('Authorization', authHeader);
      requestInit = {
        headers: headers,
      };
    }

    if (query) {
      try {
        this.client.link.headers = { Authorization: authHeader };
        const queryObjectName = camelize(objectName as string);
        const gqlQuery = gql`{
                ${queryObjectName} @jsonapi(path: "${endpoint}", includeJsonapi: true)
                  {
                    jsonapi
                    graphql
                    ${query}
                  }
                }`;
        const response = await this.client.query({ query: gqlQuery });
        const data = response.data as keyedResources;
        const object = data[queryObjectName] as jsonapiLinkObject;

        const result: queryResponse = {
          data: object.jsonapi.data,
          graphql: object.graphql,
          links: object.jsonapi.links,
        };

        return result;
      } catch (error) {
        this.onError(error as Error);
      }
    } else {
      return (await this.fetchJsonapiEndpoint(
        endpoint,
        requestInit,
        this.onError,
        res
      )) as TJsonApiBody;
    }
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
   * Get an object by path alias from local state if it exists, or fetch it from Drupal if
   * it doesn't exist in local state.
   * @param objectName Name of object to retrieve. Ex: node--article
   * @param path Path Alias of a specific resource
   * @param res response object
   * @param params user provided JSON:API parameter string or DrupalJsonApiParams object
   * @param query user provided GraphQL query
   * @param refresh a boolean value. If true, ignore local state.
   * @returns a promise containing deserialized JSON:API data for the requested
   * object
   */
  async getObjectByPath({
    objectName,
    path,
    res,
    params,
    query = false,
    refresh = false,
  }: GetObjectByPathParams): Promise<PartialState<State> | void> {
    const currentState = this.getState() as DsState;
    const dsPathTranslations = currentState.dsPathTranslations as GenericIndex;
    if (refresh || !dsPathTranslations?.[`${path}`]) {
      !this.debug ||
        console.log(
          `No match for ${path} in dsPathTranslations - calling translatePath.`
        );
      // TODO - abstract helper method to assemble requestInit and authHeader
      let requestInit = {};
      let authHeader = '';
      if (this.clientId && this.clientSecret) {
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
          // If dsPathTranslaitons exists in state, add the new path to it.
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
      objectName: objectName,
      id: id,
      res,
      params,
      query,
      refresh,
    });
    return object;
  }

  /**
   * Get an object from local state if it exists, or fetch it from Drupal if
   * it doesn't exist in local state.
   * @param objectName Name of object to retrieve. Ex: node--article
   * @param id id of a specific resource
   * @param res response object
   * @param params user provided JSON:API parameter string or DrupalJsonApiParams object
   * @param query user provided GraphQL query
   * @param all a boolean value. If true, fetch all objects in a collection.
   * @param refresh a boolean value. If true, ignore local state.
   * @returns a promise containing deserialized JSON:API data for the requested
   * object
   */
  async getObject({
    objectName,
    id,
    res = false,
    params,
    query = false,
    all = false,
    refresh = false,
  }: GetObjectParams): Promise<PartialState<State> | void> {
    const state = this.getState() as DsState;
    // Check for collection in the store
    const collectionState = state[objectName] as TJsonApiBodyDataRequired;

    // If an id is provided, find and return a resource
    if (id) {
      const resourceState = !refresh
        ? (state[`${objectName}Resources`] as keyedResources)
        : false;

      // If requested resource is in the resource store, return that
      if (resourceState) {
        const resource = resourceState[id] as keyedResources;
        if (resource) {
          !this.debug || console.log(`Matched resource ${id} in state`);
          return resource?.graphql
            ? resource.graphql
            : this.dataFormatter.deserialize(resource);
        }
      }

      // If requested resource is in the collection store, return that
      // We can't ensure that ID will be in a response if a query was defined,
      // so we have to fetch from Drupal in that case.
      if (collectionState?.data && !query && !refresh) {
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
        this.onError(
          new Error(
            `Unable to fetch the API Index.\nCheck that ${this.apiRoot} is a valid jsonapi index`
          )
        );
        return;
      }

      if (!dsApiIndex[objectName]) {
        this.onError(
          new Error(
            `Invalid objectName.\nCheck that ${objectName} is a valid node in your Drupal instance`
          )
        );
        return;
      }
      const endpoint = this.assembleEndpoint(
        objectName,
        dsApiIndex[objectName],
        id,
        params,
        query
      );

      const resourceData = (await this.conditionalFetch(
        endpoint,
        query,
        `${objectName}Resources`,
        res
      )) as keyedResources;

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

      return query
        ? resourceData.graphql
        : this.dataFormatter.deserialize(resourceData);
    } // End if (id) block

    // if there's a query, we want to fetch that
    // data with the query even if there's
    // data in collectionState
    if (
      refresh ||
      !collectionState ||
      (query && !collectionState.graphql) ||
      (collectionState.links?.next && !collectionState.links?.last && all)
    ) {
      !this.debug ||
        console.log(`Fetch Collection ${objectName} and add to state`);
      const dsApiIndex = (await this.getApiIndex()) as GenericIndex;

      if (!dsApiIndex) {
        this.onError(
          new Error(
            `Unable to fetch the API Index.\nCheck that ${this.apiRoot} is a valid jsonapi index`
          )
        );
        return;
      }

      if (!dsApiIndex[objectName]) {
        this.onError(
          new Error(
            `Invalid objectName.\nCheck that ${objectName} is a valid node in your Drupal instance or local store`
          )
        );
        return;
      }
      const endpoint = this.assembleEndpoint(
        objectName,
        dsApiIndex[objectName],
        id,
        params,
        query
      );

      const collectionData = (await this.conditionalFetch(
        endpoint,
        query,
        objectName,
        res
      )) as keyedResources;

      const fetchedCollectionState = {} as CollectionState;
      fetchedCollectionState[objectName] = collectionData;

      this.setState(fetchedCollectionState);
      // if the all flag is present
      // and if there is a next page
      // aka >50 items available,
      // fetch them and add to store
      if (all) {
        let links = collectionData?.links as TJsonApiLinks;
        // the shape of { links } is not consistent so normalize it here
        const normalizeNextLink = (linkObj: TJsonApiLinks): string => {
          if (linkObj === undefined || !linkObj.next) {
            return '';
          } else if (typeof linkObj.next === 'string') {
            return linkObj.next;
          } else if (typeof linkObj.next?.href === 'string') {
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
          // helper function to parse the next page endpoint in case there is a query
          const getNextPageEndpoint = (nextLink: string): string => {
            let nextPageEndpoint: string;
            if (query && objectName.includes('--')) {
              const querySafeName = objectName.split('--').join('/');
              nextPageEndpoint = `${querySafeName}${id ? `/${id}` : ''}?${
                nextLink.split('?')[1]
              }`;
            } else {
              nextPageEndpoint = nextLink;
            }
            return nextPageEndpoint;
          };

          // helper function to fetch and add next page's data to the store
          const getNextPage = async (nextPageEndpoint: string) => {
            if (nextPageEndpoint === '') return {} as TJsonApiLinks;
            const nextPage = (await this.conditionalFetch(
              nextPageEndpoint,
              query,
              objectName,
              res
            )) as keyedResources;

            const currentState = this.getState() as CollectionState;
            // using deepmerge to merge arrays instead of overwriting them
            const mergedCollection: keyedResources = deepmerge(
              currentState[objectName],
              nextPage
            );

            currentState[objectName] = mergedCollection;
            this.setState(currentState);

            return nextPage.links as TJsonApiLinks;
          };
          let nextPageEndpoint = getNextPageEndpoint(nextLink);
          // if current page has a next page, get that data too
          let results;
          do {
            const currentLinks = await getNextPage(nextPageEndpoint);
            results = this.getState() as ResourceState;
            links = currentLinks;
            const nextLink = normalizeNextLink(currentLinks);
            nextPageEndpoint = getNextPageEndpoint(nextLink);
          } while (links.next);

          return query
            ? results[objectName].graphql
            : this.dataFormatter.deserialize(results[objectName]);
        }
      }
      return query
        ? collectionData.graphql
        : this.dataFormatter.deserialize(collectionData);
    } else {
      !this.debug || console.log(`Matched collection ${objectName} in state`);
      const gqlCollectionState = collectionState as keyedResources;

      return query
        ? gqlCollectionState.graphql
        : this.dataFormatter.deserialize(collectionState);
    }
  }
}

export default DrupalState;
