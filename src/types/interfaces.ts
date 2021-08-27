/**
 * An interface documenting all of the named parameters that can be used when
 * creating a new instance of DrupalState
 */
export interface DrupalStateConfig {
  /**
   * Url to the root of JSON:API
   */
  apiRoot: string;
}

/**
 * Generically represents the shape of a Drupal State object
 */
export interface DsState {
  [key: string]: {
    data?: CollectionData;
  };
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
 * Represents the data contained within a resource object.
 */
export interface ResourceData {
  type: string;
  id: string;
  attributes: Record<string, unknown>;
  relationships: Record<string, unknown>;
  links: Record<string, unknown>;
}

/**
 * Describes the shape of a JSON:API collection response. See
 * {@link fetch/fetchCollection}
 */
export interface CollectionResponse {
  data: [];
  jsonapi: {
    version: string;
    [key: string]: string;
  };
  links: {
    [key: string]: string;
  };
}

/**
 * Describes a partial state object for a collection. Used with setState.
 */
export interface CollectionState {
  [key: string]: CollectionResponse;
}

/**
 * Represents the data contained within a collection object.
 */
export interface CollectionData {
  filter(isMatch: (item: ResourceData) => boolean): ResourceData;
  [key: number]: ResourceData;
}
