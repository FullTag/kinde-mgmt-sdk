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
import type { GetTimezonesResponseTimezonesInner } from './GetTimezonesResponseTimezonesInner';
import {
    GetTimezonesResponseTimezonesInnerFromJSON,
    GetTimezonesResponseTimezonesInnerFromJSONTyped,
    GetTimezonesResponseTimezonesInnerToJSON,
    GetTimezonesResponseTimezonesInnerToJSONTyped,
} from './GetTimezonesResponseTimezonesInner';

/**
 * 
 * @export
 * @interface GetTimezonesResponse
 */
export interface GetTimezonesResponse {
    /**
     * Response code.
     * @type {string}
     * @memberof GetTimezonesResponse
     */
    code?: string;
    /**
     * Response message.
     * @type {string}
     * @memberof GetTimezonesResponse
     */
    message?: string;
    /**
     * 
     * @type {Array<GetTimezonesResponseTimezonesInner>}
     * @memberof GetTimezonesResponse
     */
    timezones?: Array<GetTimezonesResponseTimezonesInner>;
}

/**
 * Check if a given object implements the GetTimezonesResponse interface.
 */
export function instanceOfGetTimezonesResponse(value: object): value is GetTimezonesResponse {
    return true;
}

export function GetTimezonesResponseFromJSON(json: any): GetTimezonesResponse {
    return GetTimezonesResponseFromJSONTyped(json, false);
}

export function GetTimezonesResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetTimezonesResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'code': json['code'] == null ? undefined : json['code'],
        'message': json['message'] == null ? undefined : json['message'],
        'timezones': json['timezones'] == null ? undefined : ((json['timezones'] as Array<any>).map(GetTimezonesResponseTimezonesInnerFromJSON)),
    };
}

  export function GetTimezonesResponseToJSON(json: any): GetTimezonesResponse {
      return GetTimezonesResponseToJSONTyped(json, false);
  }

  export function GetTimezonesResponseToJSONTyped(value?: GetTimezonesResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'code': value['code'],
        'message': value['message'],
        'timezones': value['timezones'] == null ? undefined : ((value['timezones'] as Array<any>).map(GetTimezonesResponseTimezonesInnerToJSON)),
    };
}

