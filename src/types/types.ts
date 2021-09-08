import { TJsonApiBody, TJsonApiData } from 'jsona/lib/JsonaTypes';

// Type Aliases

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
};

// Interfaces

/**
 * An interface documenting all of the named parameters that can be used when
 * creating a new instance of DrupalState
 */
export interface DrupalStateConfig {
  /**
   * Url to the root of JSON:API
   */
  apiRoot: string;
  debug?: boolean;
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
  [key: string]: string;
}

/**
 * Describes the JSON:API root response. See {@link fetch/fetchApiIndex}
 */
export interface ApiIndexResponse {
  data: [];
  links: GenericIndex;
}

// Object Interfaces
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
