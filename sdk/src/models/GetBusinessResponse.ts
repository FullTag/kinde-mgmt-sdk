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
import type { GetBusinessResponseBusiness } from './GetBusinessResponseBusiness';
import {
    GetBusinessResponseBusinessFromJSON,
    GetBusinessResponseBusinessFromJSONTyped,
    GetBusinessResponseBusinessToJSON,
    GetBusinessResponseBusinessToJSONTyped,
} from './GetBusinessResponseBusiness';

/**
 * 
 * @export
 * @interface GetBusinessResponse
 */
export interface GetBusinessResponse {
    /**
     * Response code.
     * @type {string}
     * @memberof GetBusinessResponse
     */
    code?: string;
    /**
     * Response message.
     * @type {string}
     * @memberof GetBusinessResponse
     */
    message?: string;
    /**
     * 
     * @type {GetBusinessResponseBusiness}
     * @memberof GetBusinessResponse
     */
    business?: GetBusinessResponseBusiness;
}

/**
 * Check if a given object implements the GetBusinessResponse interface.
 */
export function instanceOfGetBusinessResponse(value: object): value is GetBusinessResponse {
    return true;
}

export function GetBusinessResponseFromJSON(json: any): GetBusinessResponse {
    return GetBusinessResponseFromJSONTyped(json, false);
}

export function GetBusinessResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetBusinessResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'code': json['code'] == null ? undefined : json['code'],
        'message': json['message'] == null ? undefined : json['message'],
        'business': json['business'] == null ? undefined : GetBusinessResponseBusinessFromJSON(json['business']),
    };
}

  export function GetBusinessResponseToJSON(json: any): GetBusinessResponse {
      return GetBusinessResponseToJSONTyped(json, false);
  }

  export function GetBusinessResponseToJSONTyped(value?: GetBusinessResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'code': value['code'],
        'message': value['message'],
        'business': GetBusinessResponseBusinessToJSON(value['business']),
    };
}

