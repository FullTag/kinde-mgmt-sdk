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
 * @interface CreateApplicationRequest
 */
export interface CreateApplicationRequest {
    /**
     * The application's name.
     * @type {string}
     * @memberof CreateApplicationRequest
     */
    name?: string;
    /**
     * The application's type.
     * @type {string}
     * @memberof CreateApplicationRequest
     */
    type?: CreateApplicationRequestTypeEnum;
}


/**
 * @export
 */
export const CreateApplicationRequestTypeEnum = {
    Reg: 'reg',
    Spa: 'spa',
    M2m: 'm2m'
} as const;
export type CreateApplicationRequestTypeEnum = typeof CreateApplicationRequestTypeEnum[keyof typeof CreateApplicationRequestTypeEnum];


/**
 * Check if a given object implements the CreateApplicationRequest interface.
 */
export function instanceOfCreateApplicationRequest(value: object): value is CreateApplicationRequest {
    return true;
}

export function CreateApplicationRequestFromJSON(json: any): CreateApplicationRequest {
    return CreateApplicationRequestFromJSONTyped(json, false);
}

export function CreateApplicationRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreateApplicationRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'name': json['name'] == null ? undefined : json['name'],
        'type': json['type'] == null ? undefined : json['type'],
    };
}

export function CreateApplicationRequestToJSON(value?: CreateApplicationRequest | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'name': value['name'],
        'type': value['type'],
    };
}

