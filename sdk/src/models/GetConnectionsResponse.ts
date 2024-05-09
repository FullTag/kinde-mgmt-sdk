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
import type { Connection } from './Connection';
import {
    ConnectionFromJSON,
    ConnectionFromJSONTyped,
    ConnectionToJSON,
} from './Connection';

/**
 * 
 * @export
 * @interface GetConnectionsResponse
 */
export interface GetConnectionsResponse {
    /**
     * Response code.
     * @type {string}
     * @memberof GetConnectionsResponse
     */
    code?: string;
    /**
     * Response message.
     * @type {string}
     * @memberof GetConnectionsResponse
     */
    message?: string;
    /**
     * 
     * @type {Array<Connection>}
     * @memberof GetConnectionsResponse
     */
    connections?: Array<Connection>;
    /**
     * Whether more records exist.
     * @type {boolean}
     * @memberof GetConnectionsResponse
     */
    hasMore?: boolean;
}

/**
 * Check if a given object implements the GetConnectionsResponse interface.
 */
export function instanceOfGetConnectionsResponse(value: object): boolean {
    return true;
}

export function GetConnectionsResponseFromJSON(json: any): GetConnectionsResponse {
    return GetConnectionsResponseFromJSONTyped(json, false);
}

export function GetConnectionsResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetConnectionsResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'code': json['code'] == null ? undefined : json['code'],
        'message': json['message'] == null ? undefined : json['message'],
        'connections': json['connections'] == null ? undefined : ((json['connections'] as Array<any>).map(ConnectionFromJSON)),
        'hasMore': json['has_more'] == null ? undefined : json['has_more'],
    };
}

export function GetConnectionsResponseToJSON(value?: GetConnectionsResponse | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'code': value['code'],
        'message': value['message'],
        'connections': value['connections'] == null ? undefined : ((value['connections'] as Array<any>).map(ConnectionToJSON)),
        'has_more': value['hasMore'],
    };
}
