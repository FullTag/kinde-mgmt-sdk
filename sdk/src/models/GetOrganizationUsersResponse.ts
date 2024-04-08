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
import type { OrganizationUser } from './OrganizationUser';
import {
    OrganizationUserFromJSON,
    OrganizationUserFromJSONTyped,
    OrganizationUserToJSON,
} from './OrganizationUser';

/**
 * 
 * @export
 * @interface GetOrganizationUsersResponse
 */
export interface GetOrganizationUsersResponse {
    /**
     * Response code.
     * @type {string}
     * @memberof GetOrganizationUsersResponse
     */
    code?: string;
    /**
     * Response message.
     * @type {string}
     * @memberof GetOrganizationUsersResponse
     */
    message?: string;
    /**
     * 
     * @type {Array<OrganizationUser>}
     * @memberof GetOrganizationUsersResponse
     */
    organizationUsers?: Array<OrganizationUser>;
    /**
     * Pagination token.
     * @type {string}
     * @memberof GetOrganizationUsersResponse
     */
    nextToken?: string;
}

/**
 * Check if a given object implements the GetOrganizationUsersResponse interface.
 */
export function instanceOfGetOrganizationUsersResponse(value: object): boolean {
    return true;
}

export function GetOrganizationUsersResponseFromJSON(json: any): GetOrganizationUsersResponse {
    return GetOrganizationUsersResponseFromJSONTyped(json, false);
}

export function GetOrganizationUsersResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetOrganizationUsersResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'code': json['code'] == null ? undefined : json['code'],
        'message': json['message'] == null ? undefined : json['message'],
        'organizationUsers': json['organization_users'] == null ? undefined : ((json['organization_users'] as Array<any>).map(OrganizationUserFromJSON)),
        'nextToken': json['next_token'] == null ? undefined : json['next_token'],
    };
}

export function GetOrganizationUsersResponseToJSON(value?: GetOrganizationUsersResponse | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'code': value['code'],
        'message': value['message'],
        'organization_users': value['organizationUsers'] == null ? undefined : ((value['organizationUsers'] as Array<any>).map(OrganizationUserToJSON)),
        'next_token': value['nextToken'],
    };
}
