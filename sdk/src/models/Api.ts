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
import type { ApiApplicationsInner } from './ApiApplicationsInner';
import {
    ApiApplicationsInnerFromJSON,
    ApiApplicationsInnerFromJSONTyped,
    ApiApplicationsInnerToJSON,
} from './ApiApplicationsInner';

/**
 * 
 * @export
 * @interface Api
 */
export interface Api {
    /**
     * The API's unique identifier.
     * @type {string}
     * @memberof Api
     */
    id?: string;
    /**
     * Response code.
     * @type {string}
     * @memberof Api
     */
    code?: string;
    /**
     * The API's name.
     * @type {string}
     * @memberof Api
     */
    name?: string;
    /**
     * Response message.
     * @type {string}
     * @memberof Api
     */
    message?: string;
    /**
     * The API's audience.
     * @type {string}
     * @memberof Api
     */
    audience?: string;
    /**
     * 
     * @type {Array<ApiApplicationsInner>}
     * @memberof Api
     */
    applications?: Array<ApiApplicationsInner>;
}

/**
 * Check if a given object implements the Api interface.
 */
export function instanceOfApi(value: object): value is Api {
    return true;
}

export function ApiFromJSON(json: any): Api {
    return ApiFromJSONTyped(json, false);
}

export function ApiFromJSONTyped(json: any, ignoreDiscriminator: boolean): Api {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'code': json['code'] == null ? undefined : json['code'],
        'name': json['name'] == null ? undefined : json['name'],
        'message': json['message'] == null ? undefined : json['message'],
        'audience': json['audience'] == null ? undefined : json['audience'],
        'applications': json['applications'] == null ? undefined : ((json['applications'] as Array<any>).map(ApiApplicationsInnerFromJSON)),
    };
}

export function ApiToJSON(value?: Api | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'code': value['code'],
        'name': value['name'],
        'message': value['message'],
        'audience': value['audience'],
        'applications': value['applications'] == null ? undefined : ((value['applications'] as Array<any>).map(ApiApplicationsInnerToJSON)),
    };
}

