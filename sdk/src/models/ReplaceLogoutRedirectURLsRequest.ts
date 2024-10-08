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
 * @interface ReplaceLogoutRedirectURLsRequest
 */
export interface ReplaceLogoutRedirectURLsRequest {
    /**
     * Array of logout urls.
     * @type {Array<string>}
     * @memberof ReplaceLogoutRedirectURLsRequest
     */
    urls?: Array<string>;
}

/**
 * Check if a given object implements the ReplaceLogoutRedirectURLsRequest interface.
 */
export function instanceOfReplaceLogoutRedirectURLsRequest(value: object): value is ReplaceLogoutRedirectURLsRequest {
    return true;
}

export function ReplaceLogoutRedirectURLsRequestFromJSON(json: any): ReplaceLogoutRedirectURLsRequest {
    return ReplaceLogoutRedirectURLsRequestFromJSONTyped(json, false);
}

export function ReplaceLogoutRedirectURLsRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): ReplaceLogoutRedirectURLsRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'urls': json['urls'] == null ? undefined : json['urls'],
    };
}

  export function ReplaceLogoutRedirectURLsRequestToJSON(json: any): ReplaceLogoutRedirectURLsRequest {
      return ReplaceLogoutRedirectURLsRequestToJSONTyped(json, false);
  }

  export function ReplaceLogoutRedirectURLsRequestToJSONTyped(value?: ReplaceLogoutRedirectURLsRequest | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'urls': value['urls'],
    };
}

