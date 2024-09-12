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
import type { GetApiResponseApi } from './GetApiResponseApi';
import {
    GetApiResponseApiFromJSON,
    GetApiResponseApiFromJSONTyped,
    GetApiResponseApiToJSON,
    GetApiResponseApiToJSONTyped,
} from './GetApiResponseApi';

/**
 * 
 * @export
 * @interface GetApiResponse
 */
export interface GetApiResponse {
    /**
     * Response code.
     * @type {string}
     * @memberof GetApiResponse
     */
    code?: string;
    /**
     * Response message.
     * @type {string}
     * @memberof GetApiResponse
     */
    message?: string;
    /**
     * 
     * @type {GetApiResponseApi}
     * @memberof GetApiResponse
     */
    api?: GetApiResponseApi;
}

/**
 * Check if a given object implements the GetApiResponse interface.
 */
export function instanceOfGetApiResponse(value: object): value is GetApiResponse {
    return true;
}

export function GetApiResponseFromJSON(json: any): GetApiResponse {
    return GetApiResponseFromJSONTyped(json, false);
}

export function GetApiResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetApiResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'code': json['code'] == null ? undefined : json['code'],
        'message': json['message'] == null ? undefined : json['message'],
        'api': json['api'] == null ? undefined : GetApiResponseApiFromJSON(json['api']),
    };
}

  export function GetApiResponseToJSON(json: any): GetApiResponse {
      return GetApiResponseToJSONTyped(json, false);
  }

  export function GetApiResponseToJSONTyped(value?: GetApiResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'code': value['code'],
        'message': value['message'],
        'api': GetApiResponseApiToJSON(value['api']),
    };
}

