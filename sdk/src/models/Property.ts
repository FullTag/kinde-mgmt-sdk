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
 * @interface Property
 */
export interface Property {
    /**
     * 
     * @type {string}
     * @memberof Property
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof Property
     */
    key?: string;
    /**
     * 
     * @type {boolean}
     * @memberof Property
     */
    name?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof Property
     */
    isPrivate?: boolean;
    /**
     * 
     * @type {string}
     * @memberof Property
     */
    description?: string;
    /**
     * 
     * @type {boolean}
     * @memberof Property
     */
    isKindeProperty?: boolean;
}

/**
 * Check if a given object implements the Property interface.
 */
export function instanceOfProperty(value: object): boolean {
    return true;
}

export function PropertyFromJSON(json: any): Property {
    return PropertyFromJSONTyped(json, false);
}

export function PropertyFromJSONTyped(json: any, ignoreDiscriminator: boolean): Property {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'key': json['key'] == null ? undefined : json['key'],
        'name': json['name'] == null ? undefined : json['name'],
        'isPrivate': json['is_private'] == null ? undefined : json['is_private'],
        'description': json['description'] == null ? undefined : json['description'],
        'isKindeProperty': json['is_kinde_property'] == null ? undefined : json['is_kinde_property'],
    };
}

export function PropertyToJSON(value?: Property | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'key': value['key'],
        'name': value['name'],
        'is_private': value['isPrivate'],
        'description': value['description'],
        'is_kinde_property': value['isKindeProperty'],
    };
}

