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
 * @interface SuccessResponse
 */
export interface SuccessResponse {
    /**
     * 
     * @type {string}
     * @memberof SuccessResponse
     */
    message?: string;
    /**
     * 
     * @type {string}
     * @memberof SuccessResponse
     */
    code?: string;
}

/**
 * Check if a given object implements the SuccessResponse interface.
 */
export function instanceOfSuccessResponse(value: object): value is SuccessResponse {
    return true;
}

export function SuccessResponseFromJSON(json: any): SuccessResponse {
    return SuccessResponseFromJSONTyped(json, false);
}

export function SuccessResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): SuccessResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'] == null ? undefined : json['message'],
        'code': json['code'] == null ? undefined : json['code'],
    };
}

  export function SuccessResponseToJSON(json: any): SuccessResponse {
      return SuccessResponseToJSONTyped(json, false);
  }

  export function SuccessResponseToJSONTyped(value?: SuccessResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'message': value['message'],
        'code': value['code'],
    };
}

