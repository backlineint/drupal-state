import { TJsonApiBody, TJsonApiData } from 'jsona/lib/JsonaTypes';
import { TJsonApiDataFilterable } from './interfaces';

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
