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
import type { RedirectCallbackUrls } from './RedirectCallbackUrls';
import {
    RedirectCallbackUrlsFromJSON,
    RedirectCallbackUrlsFromJSONTyped,
    RedirectCallbackUrlsToJSON,
    RedirectCallbackUrlsToJSONTyped,
} from './RedirectCallbackUrls';

/**
 * 
 * @export
 * @interface GetRedirectCallbackUrlsResponse
 */
export interface GetRedirectCallbackUrlsResponse {
    /**
     * An application's redirect callback URLs.
     * @type {Array<RedirectCallbackUrls>}
     * @memberof GetRedirectCallbackUrlsResponse
     */
    redirectUrls?: Array<RedirectCallbackUrls>;
}

/**
 * Check if a given object implements the GetRedirectCallbackUrlsResponse interface.
 */
export function instanceOfGetRedirectCallbackUrlsResponse(value: object): value is GetRedirectCallbackUrlsResponse {
    return true;
}

export function GetRedirectCallbackUrlsResponseFromJSON(json: any): GetRedirectCallbackUrlsResponse {
    return GetRedirectCallbackUrlsResponseFromJSONTyped(json, false);
}

export function GetRedirectCallbackUrlsResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetRedirectCallbackUrlsResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'redirectUrls': json['redirect_urls'] == null ? undefined : ((json['redirect_urls'] as Array<any>).map(RedirectCallbackUrlsFromJSON)),
    };
}

  export function GetRedirectCallbackUrlsResponseToJSON(json: any): GetRedirectCallbackUrlsResponse {
      return GetRedirectCallbackUrlsResponseToJSONTyped(json, false);
  }

  export function GetRedirectCallbackUrlsResponseToJSONTyped(value?: GetRedirectCallbackUrlsResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'redirect_urls': value['redirectUrls'] == null ? undefined : ((value['redirectUrls'] as Array<any>).map(RedirectCallbackUrlsToJSON)),
    };
}

