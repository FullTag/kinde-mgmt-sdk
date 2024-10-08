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
 * @interface ReplaceRedirectCallbackURLsRequest
 */
export interface ReplaceRedirectCallbackURLsRequest {
    /**
     * Array of callback urls.
     * @type {Array<string>}
     * @memberof ReplaceRedirectCallbackURLsRequest
     */
    urls?: Array<string>;
}

/**
 * Check if a given object implements the ReplaceRedirectCallbackURLsRequest interface.
 */
export function instanceOfReplaceRedirectCallbackURLsRequest(value: object): value is ReplaceRedirectCallbackURLsRequest {
    return true;
}

export function ReplaceRedirectCallbackURLsRequestFromJSON(json: any): ReplaceRedirectCallbackURLsRequest {
    return ReplaceRedirectCallbackURLsRequestFromJSONTyped(json, false);
}

export function ReplaceRedirectCallbackURLsRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): ReplaceRedirectCallbackURLsRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'urls': json['urls'] == null ? undefined : json['urls'],
    };
}

  export function ReplaceRedirectCallbackURLsRequestToJSON(json: any): ReplaceRedirectCallbackURLsRequest {
      return ReplaceRedirectCallbackURLsRequestToJSONTyped(json, false);
  }

  export function ReplaceRedirectCallbackURLsRequestToJSONTyped(value?: ReplaceRedirectCallbackURLsRequest | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'urls': value['urls'],
    };
}

