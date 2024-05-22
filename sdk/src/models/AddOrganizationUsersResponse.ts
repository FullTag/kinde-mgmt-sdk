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
 * @interface AddOrganizationUsersResponse
 */
export interface AddOrganizationUsersResponse {
    /**
     * Response code.
     * @type {string}
     * @memberof AddOrganizationUsersResponse
     */
    code?: string;
    /**
     * Response message.
     * @type {string}
     * @memberof AddOrganizationUsersResponse
     */
    message?: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof AddOrganizationUsersResponse
     */
    usersAdded?: Array<string>;
}

/**
 * Check if a given object implements the AddOrganizationUsersResponse interface.
 */
export function instanceOfAddOrganizationUsersResponse(value: object): value is AddOrganizationUsersResponse {
    return true;
}

export function AddOrganizationUsersResponseFromJSON(json: any): AddOrganizationUsersResponse {
    return AddOrganizationUsersResponseFromJSONTyped(json, false);
}

export function AddOrganizationUsersResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): AddOrganizationUsersResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'code': json['code'] == null ? undefined : json['code'],
        'message': json['message'] == null ? undefined : json['message'],
        'usersAdded': json['users_added'] == null ? undefined : json['users_added'],
    };
}

export function AddOrganizationUsersResponseToJSON(value?: AddOrganizationUsersResponse | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'code': value['code'],
        'message': value['message'],
        'users_added': value['usersAdded'],
    };
}

