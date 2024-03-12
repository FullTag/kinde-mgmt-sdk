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
import type { Organization } from './Organization';
import {
    OrganizationFromJSON,
    OrganizationFromJSONTyped,
    OrganizationToJSON,
} from './Organization';

/**
 * 
 * @export
 * @interface GetOrganizationsResponse
 */
export interface GetOrganizationsResponse {
    /**
     * Response code.
     * @type {string}
     * @memberof GetOrganizationsResponse
     */
    code?: string;
    /**
     * Response message.
     * @type {string}
     * @memberof GetOrganizationsResponse
     */
    message?: string;
    /**
     * 
     * @type {Array<Organization>}
     * @memberof GetOrganizationsResponse
     */
    organizations?: Array<Organization>;
    /**
     * Pagination token.
     * @type {string}
     * @memberof GetOrganizationsResponse
     */
    nextToken?: string;
}

/**
 * Check if a given object implements the GetOrganizationsResponse interface.
 */
export function instanceOfGetOrganizationsResponse(value: object): boolean {
    return true;
}

export function GetOrganizationsResponseFromJSON(json: any): GetOrganizationsResponse {
    return GetOrganizationsResponseFromJSONTyped(json, false);
}

export function GetOrganizationsResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetOrganizationsResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'code': json['code'] == null ? undefined : json['code'],
        'message': json['message'] == null ? undefined : json['message'],
        'organizations': json['organizations'] == null ? undefined : ((json['organizations'] as Array<any>).map(OrganizationFromJSON)),
        'nextToken': json['next_token'] == null ? undefined : json['next_token'],
    };
}

export function GetOrganizationsResponseToJSON(value?: GetOrganizationsResponse | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'code': value['code'],
        'message': value['message'],
        'organizations': value['organizations'] == null ? undefined : ((value['organizations'] as Array<any>).map(OrganizationToJSON)),
        'next_token': value['nextToken'],
    };
}

