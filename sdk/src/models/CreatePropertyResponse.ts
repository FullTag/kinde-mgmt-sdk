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
import type { CreatePropertyResponseProperty } from './CreatePropertyResponseProperty';
import {
    CreatePropertyResponsePropertyFromJSON,
    CreatePropertyResponsePropertyFromJSONTyped,
    CreatePropertyResponsePropertyToJSON,
} from './CreatePropertyResponseProperty';

/**
 * 
 * @export
 * @interface CreatePropertyResponse
 */
export interface CreatePropertyResponse {
    /**
     * 
     * @type {string}
     * @memberof CreatePropertyResponse
     */
    message?: string;
    /**
     * 
     * @type {string}
     * @memberof CreatePropertyResponse
     */
    code?: string;
    /**
     * 
     * @type {CreatePropertyResponseProperty}
     * @memberof CreatePropertyResponse
     */
    property?: CreatePropertyResponseProperty;
}

/**
 * Check if a given object implements the CreatePropertyResponse interface.
 */
export function instanceOfCreatePropertyResponse(value: object): boolean {
    return true;
}

export function CreatePropertyResponseFromJSON(json: any): CreatePropertyResponse {
    return CreatePropertyResponseFromJSONTyped(json, false);
}

export function CreatePropertyResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreatePropertyResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'] == null ? undefined : json['message'],
        'code': json['code'] == null ? undefined : json['code'],
        'property': json['property'] == null ? undefined : CreatePropertyResponsePropertyFromJSON(json['property']),
    };
}

export function CreatePropertyResponseToJSON(value?: CreatePropertyResponse | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'message': value['message'],
        'code': value['code'],
        'property': CreatePropertyResponsePropertyToJSON(value['property']),
    };
}
