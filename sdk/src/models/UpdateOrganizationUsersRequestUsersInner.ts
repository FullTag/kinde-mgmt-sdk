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
 * @interface UpdateOrganizationUsersRequestUsersInner
 */
export interface UpdateOrganizationUsersRequestUsersInner {
    /**
     * The users id.
     * @type {string}
     * @memberof UpdateOrganizationUsersRequestUsersInner
     */
    id?: string;
    /**
     * Optional operation, set to 'delete' to remove the user from the organization.
     * @type {string}
     * @memberof UpdateOrganizationUsersRequestUsersInner
     */
    operation?: string;
    /**
     * Role keys to assign to the user.
     * @type {Array<string>}
     * @memberof UpdateOrganizationUsersRequestUsersInner
     */
    roles?: Array<string>;
    /**
     * Permission keys to assign to the user.
     * @type {Array<string>}
     * @memberof UpdateOrganizationUsersRequestUsersInner
     */
    permissions?: Array<string>;
}

/**
 * Check if a given object implements the UpdateOrganizationUsersRequestUsersInner interface.
 */
export function instanceOfUpdateOrganizationUsersRequestUsersInner(value: object): value is UpdateOrganizationUsersRequestUsersInner {
    return true;
}

export function UpdateOrganizationUsersRequestUsersInnerFromJSON(json: any): UpdateOrganizationUsersRequestUsersInner {
    return UpdateOrganizationUsersRequestUsersInnerFromJSONTyped(json, false);
}

export function UpdateOrganizationUsersRequestUsersInnerFromJSONTyped(json: any, ignoreDiscriminator: boolean): UpdateOrganizationUsersRequestUsersInner {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'operation': json['operation'] == null ? undefined : json['operation'],
        'roles': json['roles'] == null ? undefined : json['roles'],
        'permissions': json['permissions'] == null ? undefined : json['permissions'],
    };
}

export function UpdateOrganizationUsersRequestUsersInnerToJSON(value?: UpdateOrganizationUsersRequestUsersInner | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'operation': value['operation'],
        'roles': value['roles'],
        'permissions': value['permissions'],
    };
}

