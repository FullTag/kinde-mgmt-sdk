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
import type { GetApplicationResponseApplication } from './GetApplicationResponseApplication';
import {
    GetApplicationResponseApplicationFromJSON,
    GetApplicationResponseApplicationFromJSONTyped,
    GetApplicationResponseApplicationToJSON,
} from './GetApplicationResponseApplication';

/**
 * 
 * @export
 * @interface GetApplicationResponse
 */
export interface GetApplicationResponse {
    /**
     * Response code.
     * @type {string}
     * @memberof GetApplicationResponse
     */
    code?: string;
    /**
     * Response message.
     * @type {string}
     * @memberof GetApplicationResponse
     */
    message?: string;
    /**
     * 
     * @type {GetApplicationResponseApplication}
     * @memberof GetApplicationResponse
     */
    application?: GetApplicationResponseApplication;
}

/**
 * Check if a given object implements the GetApplicationResponse interface.
 */
export function instanceOfGetApplicationResponse(value: object): boolean {
    return true;
}

export function GetApplicationResponseFromJSON(json: any): GetApplicationResponse {
    return GetApplicationResponseFromJSONTyped(json, false);
}

export function GetApplicationResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetApplicationResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'code': json['code'] == null ? undefined : json['code'],
        'message': json['message'] == null ? undefined : json['message'],
        'application': json['application'] == null ? undefined : GetApplicationResponseApplicationFromJSON(json['application']),
    };
}

export function GetApplicationResponseToJSON(value?: GetApplicationResponse | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'code': value['code'],
        'message': value['message'],
        'application': GetApplicationResponseApplicationToJSON(value['application']),
    };
}

