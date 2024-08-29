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
 * @interface CreateApisResponseApi
 */
export interface CreateApisResponseApi {
    /**
     * The unique ID for the API.
     * @type {string}
     * @memberof CreateApisResponseApi
     */
    id?: string;
}

/**
 * Check if a given object implements the CreateApisResponseApi interface.
 */
export function instanceOfCreateApisResponseApi(value: object): value is CreateApisResponseApi {
    return true;
}

export function CreateApisResponseApiFromJSON(json: any): CreateApisResponseApi {
    return CreateApisResponseApiFromJSONTyped(json, false);
}

export function CreateApisResponseApiFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreateApisResponseApi {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
    };
}

export function CreateApisResponseApiToJSON(value?: CreateApisResponseApi | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
    };
}

