import { ServerResponse } from 'http';
import {
  TJsonApiBody,
  TJsonApiData,
  TJsonApiLinks,
} from 'jsona/lib/JsonaTypes';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';

// Type Aliases

/**
 * An index of string keys and values.
 */
export type stringIndex = {
  [key: string]: string;
};

/**
 * JSON:API resource responses keyed by id
 */
export type keyedResources = {
  [key: string]: TJsonApiBody;
};

/**
 * JSON:API response that requires data and can be filtered
 */
export declare type TJsonApiBodyDataRequired = {
  data: TJsonApiDataFilterable;
  included?: Array<TJsonApiData>;
  links?: TJsonApiLinks;
};

// Interfaces

/**
 * A fetch compatible function
 */
export interface fetchAdapter {
  (
    input: RequestInfo,
    init?: RequestInit | undefined,
    res?: ServerResponse | boolean
  ): Promise<Response>;
}

/**
 * An interface documenting all of the named parameters that can be used when
 * creating a new instance of DrupalState
 */
export interface DrupalStateConfig {
  /**
   * Configuration object for DrupalState instance
   */
  apiBase: string;
  apiPrefix?: string;
  defaultLocale?: string;
  clientId?: string;
  clientSecret?: string;
  fetchAdapter?: fetchAdapter;
  debug?: boolean;
  onError?: (err: Error) => void;
}

/**
 * Object representing the data returned from the oAuth token endpoint
 */
export interface TokenResponseObject {
  access_token: string;
  expires_in: number;
  token_type: string;
}

/**
 * Object containing our internal representation of the data returned from
 * the oAuth token endpoint
 */
export interface TokenObject {
  accessToken: string;
  validUntil: number;
  tokenType: string;
}

/**
 * Generically represents the shape of a Drupal State object
 */
export interface DsState {
  [key: string]: TJsonApiBody;
}

// ApiIndex interfaces
/**
 * Allows for an index of any number of string keys. See
 * {@link fetch/fetchApiIndex}
 */
export interface GenericIndex {
  [key: string]: string | GenericIndex;
}

/**
 * Describes the JSON:API root response. See {@link fetch/fetchApiIndex}
 */
export interface ApiIndexResponse {
  data: [];
  links: GenericIndex;
}

/**
 * Describes json-api-link data that includes the original jsonapi response
 */
export interface jsonapiLinkObject {
  jsonapi: {
    data: TJsonApiBody;
    links: TJsonApiLinks;
    [key: string]: TJsonApiBody | TJsonApiLinks;
  };
  __typename: string;
}

interface SharedParams {
  /**
   * The name of the object in Drupal
   * @example 'node--article'
   */
  objectName: string;
  /**
   * If included, the server response is passed to allow DrupalState to set headers
   * among other things.
   * @see {@link https://nodejs.org/docs/latest-v16.x/api/http.html#class-httpserverresponse}
   */
  res?: ServerResponse | boolean;
  /**
   * A string of Drupal JSON:API parameters.
   * @example 'include=field_media_image,
   * Or an instance of DrupalJsonApi Params.
   * @see {@link https://www.npmjs.com/package/drupal-jsonapi-params}
   */
  params?: string | DrupalJsonApiParams;
  /**
   * If true, data will be fetched from Drupal regardless of its existence in state
   */
  refresh?: boolean;
  /**
   * If true and valid credentials are passed in when creating the instance of
   * DrupalState, the request will be made anonymously
   */
  anon?: boolean;
  /**
   * @deprecated since 4.0.0
   */
  query?: string | boolean;
}
/**
 * Describes get object parameters.
 */
export interface GetObjectParams extends SharedParams {
  /**
   * The id of the object in Drupal
   */
  id?: string;
  /**
   * If true, DrupalState fetches all pages of an object if there is more than one.
   */
  all?: boolean;
}

/**
 * Describes get object by Path alias.
 */
export interface GetObjectByPathParams extends SharedParams {
  /**
   * The path to the object that Decoupled Router resolves to
   * @see {@link https://www.drupal.org/project/decoupled_router}
   * @example '/recipes/fiery-chili-sauce'
   */
  path: string;
}

/**
 * Represents an index of path translation data.
 */
export interface dsPathTranslations {
  [key: string]: {
    entity: {
      uuid: string;
    };
  };
}

/**
 * Extends TJsonApiData with filter method
 */
export interface TJsonApiDataFilterable extends TJsonApiData {
  filter(isMatch: (item: TJsonApiData) => boolean): TJsonApiData[];
}

/**
 * Describes a partial state object for a collection. Used with setState.
 */
export interface CollectionState {
  [key: string]: TJsonApiBody;
}

/**
 * Describes a partial state object for a keyed list of resources.
 */
export interface ResourceState {
  [key: string]: keyedResources;
}

/**
 * A type predicate to determine if a string or GenericIndex has an href
 * @param {GenericIndex | string} index - a string or GenericIndex
 * @returns true if index is a string or has an href property
 */
export const isGenericIndex = (
  index: GenericIndex | string
): index is GenericIndex | string =>
  typeof index === 'string' || 'href' in index;
