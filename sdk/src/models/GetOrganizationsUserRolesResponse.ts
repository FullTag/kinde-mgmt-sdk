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
import type { OrganizationUserRole } from './OrganizationUserRole';
import {
    OrganizationUserRoleFromJSON,
    OrganizationUserRoleFromJSONTyped,
    OrganizationUserRoleToJSON,
} from './OrganizationUserRole';

/**
 * 
 * @export
 * @interface GetOrganizationsUserRolesResponse
 */
export interface GetOrganizationsUserRolesResponse {
    /**
     * Response code.
     * @type {string}
     * @memberof GetOrganizationsUserRolesResponse
     */
    code?: string;
    /**
     * Response message.
     * @type {string}
     * @memberof GetOrganizationsUserRolesResponse
     */
    message?: string;
    /**
     * 
     * @type {Array<OrganizationUserRole>}
     * @memberof GetOrganizationsUserRolesResponse
     */
    roles?: Array<OrganizationUserRole>;
    /**
     * Pagination token.
     * @type {string}
     * @memberof GetOrganizationsUserRolesResponse
     */
    nextToken?: string;
}

/**
 * Check if a given object implements the GetOrganizationsUserRolesResponse interface.
 */
export function instanceOfGetOrganizationsUserRolesResponse(value: object): value is GetOrganizationsUserRolesResponse {
    return true;
}

export function GetOrganizationsUserRolesResponseFromJSON(json: any): GetOrganizationsUserRolesResponse {
    return GetOrganizationsUserRolesResponseFromJSONTyped(json, false);
}

export function GetOrganizationsUserRolesResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetOrganizationsUserRolesResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'code': json['code'] == null ? undefined : json['code'],
        'message': json['message'] == null ? undefined : json['message'],
        'roles': json['roles'] == null ? undefined : ((json['roles'] as Array<any>).map(OrganizationUserRoleFromJSON)),
        'nextToken': json['next_token'] == null ? undefined : json['next_token'],
    };
}

export function GetOrganizationsUserRolesResponseToJSON(value?: GetOrganizationsUserRolesResponse | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'code': value['code'],
        'message': value['message'],
        'roles': value['roles'] == null ? undefined : ((value['roles'] as Array<any>).map(OrganizationUserRoleToJSON)),
        'next_token': value['nextToken'],
    };
}

