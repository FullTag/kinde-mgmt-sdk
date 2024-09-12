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
import type { Permissions } from './Permissions';
import {
    PermissionsFromJSON,
    PermissionsFromJSONTyped,
    PermissionsToJSON,
    PermissionsToJSONTyped,
} from './Permissions';

/**
 * 
 * @export
 * @interface GetPermissionsResponse
 */
export interface GetPermissionsResponse {
    /**
     * Response code.
     * @type {string}
     * @memberof GetPermissionsResponse
     */
    code?: string;
    /**
     * Response message.
     * @type {string}
     * @memberof GetPermissionsResponse
     */
    message?: string;
    /**
     * 
     * @type {Array<Permissions>}
     * @memberof GetPermissionsResponse
     */
    permissions?: Array<Permissions>;
    /**
     * Pagination token.
     * @type {string}
     * @memberof GetPermissionsResponse
     */
    nextToken?: string;
}

/**
 * Check if a given object implements the GetPermissionsResponse interface.
 */
export function instanceOfGetPermissionsResponse(value: object): value is GetPermissionsResponse {
    return true;
}

export function GetPermissionsResponseFromJSON(json: any): GetPermissionsResponse {
    return GetPermissionsResponseFromJSONTyped(json, false);
}

export function GetPermissionsResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetPermissionsResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'code': json['code'] == null ? undefined : json['code'],
        'message': json['message'] == null ? undefined : json['message'],
        'permissions': json['permissions'] == null ? undefined : ((json['permissions'] as Array<any>).map(PermissionsFromJSON)),
        'nextToken': json['next_token'] == null ? undefined : json['next_token'],
    };
}

  export function GetPermissionsResponseToJSON(json: any): GetPermissionsResponse {
      return GetPermissionsResponseToJSONTyped(json, false);
  }

  export function GetPermissionsResponseToJSONTyped(value?: GetPermissionsResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'code': value['code'],
        'message': value['message'],
        'permissions': value['permissions'] == null ? undefined : ((value['permissions'] as Array<any>).map(PermissionsToJSON)),
        'next_token': value['nextToken'],
    };
}

