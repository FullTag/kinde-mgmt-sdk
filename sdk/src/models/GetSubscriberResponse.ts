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
import type { Subscriber } from './Subscriber';
import {
    SubscriberFromJSON,
    SubscriberFromJSONTyped,
    SubscriberToJSON,
    SubscriberToJSONTyped,
} from './Subscriber';

/**
 * 
 * @export
 * @interface GetSubscriberResponse
 */
export interface GetSubscriberResponse {
    /**
     * Response code.
     * @type {string}
     * @memberof GetSubscriberResponse
     */
    code?: string;
    /**
     * Response message.
     * @type {string}
     * @memberof GetSubscriberResponse
     */
    message?: string;
    /**
     * 
     * @type {Array<Subscriber>}
     * @memberof GetSubscriberResponse
     */
    subscribers?: Array<Subscriber>;
}

/**
 * Check if a given object implements the GetSubscriberResponse interface.
 */
export function instanceOfGetSubscriberResponse(value: object): value is GetSubscriberResponse {
    return true;
}

export function GetSubscriberResponseFromJSON(json: any): GetSubscriberResponse {
    return GetSubscriberResponseFromJSONTyped(json, false);
}

export function GetSubscriberResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetSubscriberResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'code': json['code'] == null ? undefined : json['code'],
        'message': json['message'] == null ? undefined : json['message'],
        'subscribers': json['subscribers'] == null ? undefined : ((json['subscribers'] as Array<any>).map(SubscriberFromJSON)),
    };
}

  export function GetSubscriberResponseToJSON(json: any): GetSubscriberResponse {
      return GetSubscriberResponseToJSONTyped(json, false);
  }

  export function GetSubscriberResponseToJSONTyped(value?: GetSubscriberResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'code': value['code'],
        'message': value['message'],
        'subscribers': value['subscribers'] == null ? undefined : ((value['subscribers'] as Array<any>).map(SubscriberToJSON)),
    };
}

