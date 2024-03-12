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
 * @interface CreatePropertyResponseProperty
 */
export interface CreatePropertyResponseProperty {
    /**
     * The property's ID.
     * @type {string}
     * @memberof CreatePropertyResponseProperty
     */
    id?: string;
}

/**
 * Check if a given object implements the CreatePropertyResponseProperty interface.
 */
export function instanceOfCreatePropertyResponseProperty(value: object): boolean {
    return true;
}

export function CreatePropertyResponsePropertyFromJSON(json: any): CreatePropertyResponseProperty {
    return CreatePropertyResponsePropertyFromJSONTyped(json, false);
}

export function CreatePropertyResponsePropertyFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreatePropertyResponseProperty {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
    };
}

export function CreatePropertyResponsePropertyToJSON(value?: CreatePropertyResponseProperty | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
    };
}

