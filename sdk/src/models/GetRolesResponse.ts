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
import type { Roles } from './Roles';
import {
    RolesFromJSON,
    RolesFromJSONTyped,
    RolesToJSON,
} from './Roles';

/**
 * 
 * @export
 * @interface GetRolesResponse
 */
export interface GetRolesResponse {
    /**
     * Response code.
     * @type {string}
     * @memberof GetRolesResponse
     */
    code?: string;
    /**
     * Response message.
     * @type {string}
     * @memberof GetRolesResponse
     */
    message?: string;
    /**
     * 
     * @type {Array<Roles>}
     * @memberof GetRolesResponse
     */
    roles?: Array<Roles>;
    /**
     * Pagination token.
     * @type {string}
     * @memberof GetRolesResponse
     */
    nextToken?: string;
}

/**
 * Check if a given object implements the GetRolesResponse interface.
 */
export function instanceOfGetRolesResponse(value: object): value is GetRolesResponse {
    return true;
}

export function GetRolesResponseFromJSON(json: any): GetRolesResponse {
    return GetRolesResponseFromJSONTyped(json, false);
}

export function GetRolesResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetRolesResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'code': json['code'] == null ? undefined : json['code'],
        'message': json['message'] == null ? undefined : json['message'],
        'roles': json['roles'] == null ? undefined : ((json['roles'] as Array<any>).map(RolesFromJSON)),
        'nextToken': json['next_token'] == null ? undefined : json['next_token'],
    };
}

export function GetRolesResponseToJSON(value?: GetRolesResponse | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'code': value['code'],
        'message': value['message'],
        'roles': value['roles'] == null ? undefined : ((value['roles'] as Array<any>).map(RolesToJSON)),
        'next_token': value['nextToken'],
    };
}

