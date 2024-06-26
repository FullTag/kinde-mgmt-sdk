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
 * @interface UpdateApplicationRequest
 */
export interface UpdateApplicationRequest {
    /**
     * The application's name.
     * @type {string}
     * @memberof UpdateApplicationRequest
     */
    name?: string;
    /**
     * The application's language key.
     * @type {string}
     * @memberof UpdateApplicationRequest
     */
    languageKey?: string;
    /**
     * The application's logout uris.
     * @type {Array<string>}
     * @memberof UpdateApplicationRequest
     */
    logoutUris?: Array<string>;
    /**
     * The application's redirect uris.
     * @type {Array<string>}
     * @memberof UpdateApplicationRequest
     */
    redirectUris?: Array<string>;
}

/**
 * Check if a given object implements the UpdateApplicationRequest interface.
 */
export function instanceOfUpdateApplicationRequest(value: object): value is UpdateApplicationRequest {
    return true;
}

export function UpdateApplicationRequestFromJSON(json: any): UpdateApplicationRequest {
    return UpdateApplicationRequestFromJSONTyped(json, false);
}

export function UpdateApplicationRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): UpdateApplicationRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'name': json['name'] == null ? undefined : json['name'],
        'languageKey': json['language_key'] == null ? undefined : json['language_key'],
        'logoutUris': json['logout_uris'] == null ? undefined : json['logout_uris'],
        'redirectUris': json['redirect_uris'] == null ? undefined : json['redirect_uris'],
    };
}

export function UpdateApplicationRequestToJSON(value?: UpdateApplicationRequest | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'name': value['name'],
        'language_key': value['languageKey'],
        'logout_uris': value['logoutUris'],
        'redirect_uris': value['redirectUris'],
    };
}

