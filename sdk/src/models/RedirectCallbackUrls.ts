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
 * @interface RedirectCallbackUrls
 */
export interface RedirectCallbackUrls {
    /**
     * An application's redirect URLs.
     * @type {Array<string>}
     * @memberof RedirectCallbackUrls
     */
    redirectUrls?: Array<string>;
}

/**
 * Check if a given object implements the RedirectCallbackUrls interface.
 */
export function instanceOfRedirectCallbackUrls(value: object): boolean {
    return true;
}

export function RedirectCallbackUrlsFromJSON(json: any): RedirectCallbackUrls {
    return RedirectCallbackUrlsFromJSONTyped(json, false);
}

export function RedirectCallbackUrlsFromJSONTyped(json: any, ignoreDiscriminator: boolean): RedirectCallbackUrls {
    if (json == null) {
        return json;
    }
    return {
        
        'redirectUrls': json['redirect_urls'] == null ? undefined : json['redirect_urls'],
    };
}

export function RedirectCallbackUrlsToJSON(value?: RedirectCallbackUrls | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'redirect_urls': value['redirectUrls'],
    };
}

