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
import type { UsersResponseUsersInner } from './UsersResponseUsersInner';
import {
    UsersResponseUsersInnerFromJSON,
    UsersResponseUsersInnerFromJSONTyped,
    UsersResponseUsersInnerToJSON,
    UsersResponseUsersInnerToJSONTyped,
} from './UsersResponseUsersInner';

/**
 * 
 * @export
 * @interface UsersResponse
 */
export interface UsersResponse {
    /**
     * Response code.
     * @type {string}
     * @memberof UsersResponse
     */
    code?: string;
    /**
     * Response message.
     * @type {string}
     * @memberof UsersResponse
     */
    message?: string;
    /**
     * 
     * @type {Array<UsersResponseUsersInner>}
     * @memberof UsersResponse
     */
    users?: Array<UsersResponseUsersInner>;
    /**
     * Pagination token.
     * @type {string}
     * @memberof UsersResponse
     */
    nextToken?: string;
}

/**
 * Check if a given object implements the UsersResponse interface.
 */
export function instanceOfUsersResponse(value: object): value is UsersResponse {
    return true;
}

export function UsersResponseFromJSON(json: any): UsersResponse {
    return UsersResponseFromJSONTyped(json, false);
}

export function UsersResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): UsersResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'code': json['code'] == null ? undefined : json['code'],
        'message': json['message'] == null ? undefined : json['message'],
        'users': json['users'] == null ? undefined : ((json['users'] as Array<any>).map(UsersResponseUsersInnerFromJSON)),
        'nextToken': json['next_token'] == null ? undefined : json['next_token'],
    };
}

  export function UsersResponseToJSON(json: any): UsersResponse {
      return UsersResponseToJSONTyped(json, false);
  }

  export function UsersResponseToJSONTyped(value?: UsersResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'code': value['code'],
        'message': value['message'],
        'users': value['users'] == null ? undefined : ((value['users'] as Array<any>).map(UsersResponseUsersInnerToJSON)),
        'next_token': value['nextToken'],
    };
}

