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
 * @interface Role
 */
export interface Role {
    /**
     * 
     * @type {string}
     * @memberof Role
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof Role
     */
    key?: string;
    /**
     * 
     * @type {string}
     * @memberof Role
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof Role
     */
    description?: string;
}

/**
 * Check if a given object implements the Role interface.
 */
export function instanceOfRole(value: object): boolean {
    return true;
}

export function RoleFromJSON(json: any): Role {
    return RoleFromJSONTyped(json, false);
}

export function RoleFromJSONTyped(json: any, ignoreDiscriminator: boolean): Role {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'key': json['key'] == null ? undefined : json['key'],
        'name': json['name'] == null ? undefined : json['name'],
        'description': json['description'] == null ? undefined : json['description'],
    };
}

export function RoleToJSON(value?: Role | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'key': value['key'],
        'name': value['name'],
        'description': value['description'],
    };
}

