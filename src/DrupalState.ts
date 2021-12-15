import { ServerResponse } from 'http';
import fetch from 'isomorphic-fetch';
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

import fetchApiIndex from './fetch/fetchApiIndex';
import fetchJsonapiEndpoint from './fetch/fetchJsonapiEndpoint';
import translatePath from './fetch/translatePath';
import fetchToken from './fetch/fetchToken';

import { TJsonApiBody } from 'jsona/lib/JsonaTypes';
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
} from './types/types';

class DrupalState {
  apiBase: string;
  apiPrefix: string;
  defaultLocale?: string;
  apiRoot: string;
  private clientId: string | undefined;
  private clientSecret: string | undefined;
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
  /**
   * DrupalJsonApiParams - see [https://www.npmjs.com/package/drupal-jsonapi-params](https://www.npmjs.com/package/drupal-jsonapi-params)
   */
  params: DrupalJsonApiParams;

  constructor({
    apiBase,
    apiPrefix = 'jsonapi',
    defaultLocale,
    clientId,
    clientSecret,
    debug = false,
  }: DrupalStateConfig) {
    this.apiBase = apiBase;
    this.apiPrefix = apiPrefix;
    this.defaultLocale = defaultLocale;
    this.apiRoot = this.assembleApiRoot();
    // TODO - .env support? Or should the consuming app be responsible for that?
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.auth = this.clientId && this.clientSecret ? true : false;
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

    // TODO - fix JsonApiLink type defs - unknown feels like a hack.
    const jsonApiLink = new JsonApiLink({
      uri: this.apiRoot,
      customFetch: fetch,
    }) as unknown as ApolloLink;

    this.client = new ApolloClient({
      link: jsonApiLink,
      cache: new InMemoryCache(),
    }) as ApolloClientWithHeaders;
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
   * @param query user provided GraphQL query
   * @returns a full endpoint URL or a relative endpoint URL is a query is provided
   */
  assembleEndpoint(
    objectName: string,
    index: string | GenericIndex,
    id = '',
    query?: string | boolean
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

      this.params.addFields(objectName, fields);
      // Check here to make sure apiRoot has trailing slash?
      endpoint = endpoint.replace(this.apiRoot, '');
    }

    if (this.params.getQueryString()) {
      endpoint += `?${this.params.getQueryString()}`;
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
        tokenRequestBody
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
    return await fetchApiIndex(apiRoot);
  }

  /**
   *
   * Wraps {@link fetch/fetchJsonapiEndpoint} function so it can be overridden.
   */
  async fetchJsonapiEndpoint(
    endpoint: string,
    requestInit = {},
    res: ServerResponse | boolean
  ): Promise<void | TJsonApiBody> {
    return await fetchJsonapiEndpoint(endpoint, requestInit, res);
  }

  /**
   * If a query is provided, fetches data using apollo-link-json-api, otherwise uses out fetch method.
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
  ): Promise<TJsonApiBody> {
    let requestInit = {};
    let authHeader = '';
    if (this.clientId && this.clientSecret) {
      authHeader = await this.getAuthHeader();
      requestInit = {
        headers: {
          Authorization: authHeader,
        },
      };
    }

    if (query) {
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
      return (await this.client.query({ query: gqlQuery }).then(response => {
        const data = response.data as keyedResources;
        const object = data[queryObjectName] as jsonapiLinkObject;
        return {
          data: object.jsonapi.data,
          graphql: object.graphql,
        };
      })) as TJsonApiBody;
    } else {
      return (await this.fetchJsonapiEndpoint(
        endpoint,
        requestInit,
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
      // TODO - consider adding this to the DrupalState class rather than adding
      // data that we rely on to the store.
      this.setState({ dsApiIndex: dsApiIndexData });

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
   * @param query user provided GraphQL query
   * @returns a promise containing deserialized JSON:API data for the requested
   * object
   */
  async getObjectByPath({
    objectName,
    path,
    res,
    query = false,
  }: GetObjectByPathParams): Promise<PartialState<State>> {
    const currentState = this.getState() as DsState;
    const dsPathTranslations = currentState.dsPathTranslations as GenericIndex;
    if (!dsPathTranslations?.[`${path}`]) {
      !this.debug ||
        console.log(
          `No match for ${path} in dsPathTranslations - calling translatePath.`
        );
      // TODO - abstract helper method to assemble requestInit and authHeader
      let requestInit = {};
      let authHeader = '';
      if (this.clientId && this.clientSecret) {
        authHeader = await this.getAuthHeader();
        requestInit = {
          headers: {
            Authorization: authHeader,
          },
        };
      }
      const response = (await translatePath(
        this.apiBase + '/router/translate-path',
        path,
        requestInit,
        false
      )) as TJsonApiBody;
      if (response) {
        const pathTranslationsState = currentState['dsPathTranslations'];

        if (pathTranslationsState) {
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
      query,
    });
    return object;
  }

  /**
   * Get an object from local state if it exists, or fetch it from Drupal if
   * it doesn't exist in local state.
   * @param objectName Name of object to retrieve. Ex: node--article
   * @param id id of a specific resource
   * @param res response object
   * @param query user provided GraphQL query
   * @returns a promise containing deserialized JSON:API data for the requested
   * object
   */
  async getObject({
    objectName,
    id,
    res = false,
    query = false,
  }: GetObjectParams): Promise<PartialState<State>> {
    const state = this.getState() as DsState;
    // Check for collection in the store
    const collectionState = state[objectName] as TJsonApiBodyDataRequired;

    // If an id is provided, find and return a resource
    if (id) {
      const resourceState = state[`${objectName}Resources`] as keyedResources;

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
      if (collectionState?.data && !query) {
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
      const endpoint = this.assembleEndpoint(
        objectName,
        dsApiIndex[objectName],
        id,
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

    if (!collectionState) {
      !this.debug ||
        console.log(`Fetch Collection ${objectName} and add to state`);
      const dsApiIndex = (await this.getApiIndex()) as GenericIndex;
      const endpoint = this.assembleEndpoint(
        objectName,
        dsApiIndex[objectName],
        id,
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
