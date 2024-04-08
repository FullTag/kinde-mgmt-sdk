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
 * @interface Apis
 */
export interface Apis {
    /**
     * Unique id of the API.
     * @type {string}
     * @memberof Apis
     */
    id?: string;
    /**
     * The API's name.
     * @type {string}
     * @memberof Apis
     */
    name?: string;
    /**
     * The logical identifier for the API.
     * @type {string}
     * @memberof Apis
     */
    audience?: string;
    /**
     * Whether it is the management API or not.
     * @type {boolean}
     * @memberof Apis
     */
    isManagementApi?: boolean;
}

/**
 * Check if a given object implements the Apis interface.
 */
export function instanceOfApis(value: object): boolean {
    return true;
}

export function ApisFromJSON(json: any): Apis {
    return ApisFromJSONTyped(json, false);
}

export function ApisFromJSONTyped(json: any, ignoreDiscriminator: boolean): Apis {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'name': json['name'] == null ? undefined : json['name'],
        'audience': json['audience'] == null ? undefined : json['audience'],
        'isManagementApi': json['is_management_api'] == null ? undefined : json['is_management_api'],
    };
}

export function ApisToJSON(value?: Apis | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'name': value['name'],
        'audience': value['audience'],
        'is_management_api': value['isManagementApi'],
    };
}
