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
 * @interface CreateRoleRequest
 */
export interface CreateRoleRequest {
    /**
     * The role's name.
     * @type {string}
     * @memberof CreateRoleRequest
     */
    name?: string;
    /**
     * The role's description.
     * @type {string}
     * @memberof CreateRoleRequest
     */
    description?: string;
    /**
     * The role identifier to use in code.
     * @type {string}
     * @memberof CreateRoleRequest
     */
    key?: string;
    /**
     * Set role as default for new users.
     * @type {boolean}
     * @memberof CreateRoleRequest
     */
    isDefaultRole?: boolean;
}

/**
 * Check if a given object implements the CreateRoleRequest interface.
 */
export function instanceOfCreateRoleRequest(value: object): value is CreateRoleRequest {
    return true;
}

export function CreateRoleRequestFromJSON(json: any): CreateRoleRequest {
    return CreateRoleRequestFromJSONTyped(json, false);
}

export function CreateRoleRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreateRoleRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'name': json['name'] == null ? undefined : json['name'],
        'description': json['description'] == null ? undefined : json['description'],
        'key': json['key'] == null ? undefined : json['key'],
        'isDefaultRole': json['is_default_role'] == null ? undefined : json['is_default_role'],
    };
}

  export function CreateRoleRequestToJSON(json: any): CreateRoleRequest {
      return CreateRoleRequestToJSONTyped(json, false);
  }

  export function CreateRoleRequestToJSONTyped(value?: CreateRoleRequest | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'name': value['name'],
        'description': value['description'],
        'key': value['key'],
        'is_default_role': value['isDefaultRole'],
    };
}

