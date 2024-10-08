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
import type { CreateApplicationResponseApplication } from './CreateApplicationResponseApplication';
import {
    CreateApplicationResponseApplicationFromJSON,
    CreateApplicationResponseApplicationFromJSONTyped,
    CreateApplicationResponseApplicationToJSON,
    CreateApplicationResponseApplicationToJSONTyped,
} from './CreateApplicationResponseApplication';

/**
 * 
 * @export
 * @interface CreateApplicationResponse
 */
export interface CreateApplicationResponse {
    /**
     * Response code.
     * @type {string}
     * @memberof CreateApplicationResponse
     */
    code?: string;
    /**
     * Response message.
     * @type {string}
     * @memberof CreateApplicationResponse
     */
    message?: string;
    /**
     * 
     * @type {CreateApplicationResponseApplication}
     * @memberof CreateApplicationResponse
     */
    application?: CreateApplicationResponseApplication;
}

/**
 * Check if a given object implements the CreateApplicationResponse interface.
 */
export function instanceOfCreateApplicationResponse(value: object): value is CreateApplicationResponse {
    return true;
}

export function CreateApplicationResponseFromJSON(json: any): CreateApplicationResponse {
    return CreateApplicationResponseFromJSONTyped(json, false);
}

export function CreateApplicationResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreateApplicationResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'code': json['code'] == null ? undefined : json['code'],
        'message': json['message'] == null ? undefined : json['message'],
        'application': json['application'] == null ? undefined : CreateApplicationResponseApplicationFromJSON(json['application']),
    };
}

  export function CreateApplicationResponseToJSON(json: any): CreateApplicationResponse {
      return CreateApplicationResponseToJSONTyped(json, false);
  }

  export function CreateApplicationResponseToJSONTyped(value?: CreateApplicationResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'code': value['code'],
        'message': value['message'],
        'application': CreateApplicationResponseApplicationToJSON(value['application']),
    };
}

