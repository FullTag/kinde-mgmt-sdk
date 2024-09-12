/* tslint:disable */
/* eslint-disable */
/**
 * Kinde Management API
 * Provides endpoints to manage your Kinde Businesses
 *
 * The version of the OpenAPI document: 1
 * Contact: support@kinde.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
import type { GetOrganizationFeatureFlagsResponseFeatureFlagsValue } from './GetOrganizationFeatureFlagsResponseFeatureFlagsValue';
import {
    GetOrganizationFeatureFlagsResponseFeatureFlagsValueFromJSON,
    GetOrganizationFeatureFlagsResponseFeatureFlagsValueFromJSONTyped,
    GetOrganizationFeatureFlagsResponseFeatureFlagsValueToJSON,
    GetOrganizationFeatureFlagsResponseFeatureFlagsValueToJSONTyped,
} from './GetOrganizationFeatureFlagsResponseFeatureFlagsValue';

/**
 * 
 * @export
 * @interface GetEnvironmentFeatureFlagsResponse
 */
export interface GetEnvironmentFeatureFlagsResponse {
    /**
     * Response code.
     * @type {string}
     * @memberof GetEnvironmentFeatureFlagsResponse
     */
    code?: string;
    /**
     * Response message.
     * @type {string}
     * @memberof GetEnvironmentFeatureFlagsResponse
     */
    message?: string;
    /**
     * The environment's feature flag settings.
     * @type {{ [key: string]: GetOrganizationFeatureFlagsResponseFeatureFlagsValue; }}
     * @memberof GetEnvironmentFeatureFlagsResponse
     */
    featureFlags?: { [key: string]: GetOrganizationFeatureFlagsResponseFeatureFlagsValue; };
    /**
     * Pagination token.
     * @type {string}
     * @memberof GetEnvironmentFeatureFlagsResponse
     */
    nextToken?: string;
}

/**
 * Check if a given object implements the GetEnvironmentFeatureFlagsResponse interface.
 */
export function instanceOfGetEnvironmentFeatureFlagsResponse(value: object): value is GetEnvironmentFeatureFlagsResponse {
    return true;
}

export function GetEnvironmentFeatureFlagsResponseFromJSON(json: any): GetEnvironmentFeatureFlagsResponse {
    return GetEnvironmentFeatureFlagsResponseFromJSONTyped(json, false);
}

export function GetEnvironmentFeatureFlagsResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetEnvironmentFeatureFlagsResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'code': json['code'] == null ? undefined : json['code'],
        'message': json['message'] == null ? undefined : json['message'],
        'featureFlags': json['feature_flags'] == null ? undefined : (mapValues(json['feature_flags'], GetOrganizationFeatureFlagsResponseFeatureFlagsValueFromJSON)),
        'nextToken': json['next_token'] == null ? undefined : json['next_token'],
    };
}

  export function GetEnvironmentFeatureFlagsResponseToJSON(json: any): GetEnvironmentFeatureFlagsResponse {
      return GetEnvironmentFeatureFlagsResponseToJSONTyped(json, false);
  }

  export function GetEnvironmentFeatureFlagsResponseToJSONTyped(value?: GetEnvironmentFeatureFlagsResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'code': value['code'],
        'message': value['message'],
        'feature_flags': value['featureFlags'] == null ? undefined : (mapValues(value['featureFlags'], GetOrganizationFeatureFlagsResponseFeatureFlagsValueToJSON)),
        'next_token': value['nextToken'],
    };
}

