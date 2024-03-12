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
import type { PropertyValue } from './PropertyValue';
import {
    PropertyValueFromJSON,
    PropertyValueFromJSONTyped,
    PropertyValueToJSON,
} from './PropertyValue';

/**
 * 
 * @export
 * @interface GetPropertyValuesResponse
 */
export interface GetPropertyValuesResponse {
    /**
     * Response code.
     * @type {string}
     * @memberof GetPropertyValuesResponse
     */
    code?: string;
    /**
     * Response message.
     * @type {string}
     * @memberof GetPropertyValuesResponse
     */
    message?: string;
    /**
     * 
     * @type {Array<PropertyValue>}
     * @memberof GetPropertyValuesResponse
     */
    properties?: Array<PropertyValue>;
    /**
     * Pagination token.
     * @type {string}
     * @memberof GetPropertyValuesResponse
     */
    nextToken?: string;
}

/**
 * Check if a given object implements the GetPropertyValuesResponse interface.
 */
export function instanceOfGetPropertyValuesResponse(value: object): boolean {
    return true;
}

export function GetPropertyValuesResponseFromJSON(json: any): GetPropertyValuesResponse {
    return GetPropertyValuesResponseFromJSONTyped(json, false);
}

export function GetPropertyValuesResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetPropertyValuesResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'code': json['code'] == null ? undefined : json['code'],
        'message': json['message'] == null ? undefined : json['message'],
        'properties': json['properties'] == null ? undefined : ((json['properties'] as Array<any>).map(PropertyValueFromJSON)),
        'nextToken': json['next_token'] == null ? undefined : json['next_token'],
    };
}

export function GetPropertyValuesResponseToJSON(value?: GetPropertyValuesResponse | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'code': value['code'],
        'message': value['message'],
        'properties': value['properties'] == null ? undefined : ((value['properties'] as Array<any>).map(PropertyValueToJSON)),
        'next_token': value['nextToken'],
    };
}

