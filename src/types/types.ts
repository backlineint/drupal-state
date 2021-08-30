import { JsonapiResponse } from './interfaces';

/**
 * JSON:API resource responses keyed by id
 */
export type keyedResources = { [key: string]: JsonapiResponse };
