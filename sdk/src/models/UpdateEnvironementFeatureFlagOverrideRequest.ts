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
/**
 * 
 * @export
 * @interface UpdateEnvironementFeatureFlagOverrideRequest
 */
export interface UpdateEnvironementFeatureFlagOverrideRequest {
    /**
     * The flag override value.
     * @type {string}
     * @memberof UpdateEnvironementFeatureFlagOverrideRequest
     */
    value: string;
}

/**
 * Check if a given object implements the UpdateEnvironementFeatureFlagOverrideRequest interface.
 */
export function instanceOfUpdateEnvironementFeatureFlagOverrideRequest(value: object): value is UpdateEnvironementFeatureFlagOverrideRequest {
    if (!('value' in value) || value['value'] === undefined) return false;
    return true;
}

export function UpdateEnvironementFeatureFlagOverrideRequestFromJSON(json: any): UpdateEnvironementFeatureFlagOverrideRequest {
    return UpdateEnvironementFeatureFlagOverrideRequestFromJSONTyped(json, false);
}

export function UpdateEnvironementFeatureFlagOverrideRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): UpdateEnvironementFeatureFlagOverrideRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'value': json['value'],
    };
}

  export function UpdateEnvironementFeatureFlagOverrideRequestToJSON(json: any): UpdateEnvironementFeatureFlagOverrideRequest {
      return UpdateEnvironementFeatureFlagOverrideRequestToJSONTyped(json, false);
  }

  export function UpdateEnvironementFeatureFlagOverrideRequestToJSONTyped(value?: UpdateEnvironementFeatureFlagOverrideRequest | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'value': value['value'],
    };
}

