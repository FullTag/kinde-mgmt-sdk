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
 * @interface GetOrganizationFeatureFlagsResponse
 */
export interface GetOrganizationFeatureFlagsResponse {
    /**
     * Response code.
     * @type {string}
     * @memberof GetOrganizationFeatureFlagsResponse
     */
    code?: string;
    /**
     * Response message.
     * @type {string}
     * @memberof GetOrganizationFeatureFlagsResponse
     */
    message?: string;
    /**
     * The environment's feature flag settings.
     * @type {{ [key: string]: GetOrganizationFeatureFlagsResponseFeatureFlagsValue; }}
     * @memberof GetOrganizationFeatureFlagsResponse
     */
    featureFlags?: { [key: string]: GetOrganizationFeatureFlagsResponseFeatureFlagsValue; };
}

/**
 * Check if a given object implements the GetOrganizationFeatureFlagsResponse interface.
 */
export function instanceOfGetOrganizationFeatureFlagsResponse(value: object): value is GetOrganizationFeatureFlagsResponse {
    return true;
}

export function GetOrganizationFeatureFlagsResponseFromJSON(json: any): GetOrganizationFeatureFlagsResponse {
    return GetOrganizationFeatureFlagsResponseFromJSONTyped(json, false);
}

export function GetOrganizationFeatureFlagsResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetOrganizationFeatureFlagsResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'code': json['code'] == null ? undefined : json['code'],
        'message': json['message'] == null ? undefined : json['message'],
        'featureFlags': json['feature_flags'] == null ? undefined : (mapValues(json['feature_flags'], GetOrganizationFeatureFlagsResponseFeatureFlagsValueFromJSON)),
    };
}

  export function GetOrganizationFeatureFlagsResponseToJSON(json: any): GetOrganizationFeatureFlagsResponse {
      return GetOrganizationFeatureFlagsResponseToJSONTyped(json, false);
  }

  export function GetOrganizationFeatureFlagsResponseToJSONTyped(value?: GetOrganizationFeatureFlagsResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'code': value['code'],
        'message': value['message'],
        'feature_flags': value['featureFlags'] == null ? undefined : (mapValues(value['featureFlags'], GetOrganizationFeatureFlagsResponseFeatureFlagsValueToJSON)),
    };
}

