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
 * @interface SubscribersSubscriber
 */
export interface SubscribersSubscriber {
    /**
     * 
     * @type {string}
     * @memberof SubscribersSubscriber
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof SubscribersSubscriber
     */
    email?: string;
    /**
     * 
     * @type {string}
     * @memberof SubscribersSubscriber
     */
    fullName?: string;
    /**
     * 
     * @type {string}
     * @memberof SubscribersSubscriber
     */
    firstName?: string;
    /**
     * 
     * @type {string}
     * @memberof SubscribersSubscriber
     */
    lastName?: string;
}

/**
 * Check if a given object implements the SubscribersSubscriber interface.
 */
export function instanceOfSubscribersSubscriber(value: object): boolean {
    return true;
}

export function SubscribersSubscriberFromJSON(json: any): SubscribersSubscriber {
    return SubscribersSubscriberFromJSONTyped(json, false);
}

export function SubscribersSubscriberFromJSONTyped(json: any, ignoreDiscriminator: boolean): SubscribersSubscriber {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'email': json['email'] == null ? undefined : json['email'],
        'fullName': json['full_name'] == null ? undefined : json['full_name'],
        'firstName': json['first_name'] == null ? undefined : json['first_name'],
        'lastName': json['last_name'] == null ? undefined : json['last_name'],
    };
}

export function SubscribersSubscriberToJSON(value?: SubscribersSubscriber | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'email': value['email'],
        'full_name': value['fullName'],
        'first_name': value['firstName'],
        'last_name': value['lastName'],
    };
}
