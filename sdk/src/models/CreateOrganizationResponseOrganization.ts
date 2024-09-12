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
 * @interface CreateOrganizationResponseOrganization
 */
export interface CreateOrganizationResponseOrganization {
    /**
     * The organization's unique code.
     * @type {string}
     * @memberof CreateOrganizationResponseOrganization
     */
    code?: string;
}

/**
 * Check if a given object implements the CreateOrganizationResponseOrganization interface.
 */
export function instanceOfCreateOrganizationResponseOrganization(value: object): value is CreateOrganizationResponseOrganization {
    return true;
}

export function CreateOrganizationResponseOrganizationFromJSON(json: any): CreateOrganizationResponseOrganization {
    return CreateOrganizationResponseOrganizationFromJSONTyped(json, false);
}

export function CreateOrganizationResponseOrganizationFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreateOrganizationResponseOrganization {
    if (json == null) {
        return json;
    }
    return {
        
        'code': json['code'] == null ? undefined : json['code'],
    };
}

  export function CreateOrganizationResponseOrganizationToJSON(json: any): CreateOrganizationResponseOrganization {
      return CreateOrganizationResponseOrganizationToJSONTyped(json, false);
  }

  export function CreateOrganizationResponseOrganizationToJSONTyped(value?: CreateOrganizationResponseOrganization | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'code': value['code'],
    };
}

