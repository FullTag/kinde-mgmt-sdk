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
 * @interface UpdateOrganizationUsersResponse
 */
export interface UpdateOrganizationUsersResponse {
    /**
     * 
     * @type {string}
     * @memberof UpdateOrganizationUsersResponse
     */
    message?: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof UpdateOrganizationUsersResponse
     */
    usersAdded?: Array<string>;
    /**
     * 
     * @type {Array<string>}
     * @memberof UpdateOrganizationUsersResponse
     */
    usersUpdated?: Array<string>;
    /**
     * 
     * @type {Array<string>}
     * @memberof UpdateOrganizationUsersResponse
     */
    usersRemoved?: Array<string>;
}

/**
 * Check if a given object implements the UpdateOrganizationUsersResponse interface.
 */
export function instanceOfUpdateOrganizationUsersResponse(value: object): value is UpdateOrganizationUsersResponse {
    return true;
}

export function UpdateOrganizationUsersResponseFromJSON(json: any): UpdateOrganizationUsersResponse {
    return UpdateOrganizationUsersResponseFromJSONTyped(json, false);
}

export function UpdateOrganizationUsersResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): UpdateOrganizationUsersResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'] == null ? undefined : json['message'],
        'usersAdded': json['users_added'] == null ? undefined : json['users_added'],
        'usersUpdated': json['users_updated'] == null ? undefined : json['users_updated'],
        'usersRemoved': json['users_removed'] == null ? undefined : json['users_removed'],
    };
}

  export function UpdateOrganizationUsersResponseToJSON(json: any): UpdateOrganizationUsersResponse {
      return UpdateOrganizationUsersResponseToJSONTyped(json, false);
  }

  export function UpdateOrganizationUsersResponseToJSONTyped(value?: UpdateOrganizationUsersResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'message': value['message'],
        'users_added': value['usersAdded'],
        'users_updated': value['usersUpdated'],
        'users_removed': value['usersRemoved'],
    };
}

