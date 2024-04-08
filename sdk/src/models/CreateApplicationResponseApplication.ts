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
 * @interface CreateApplicationResponseApplication
 */
export interface CreateApplicationResponseApplication {
    /**
     * The application's identifier.
     * @type {string}
     * @memberof CreateApplicationResponseApplication
     */
    id?: string;
    /**
     * The application's client id.
     * @type {string}
     * @memberof CreateApplicationResponseApplication
     */
    clientId?: string;
    /**
     * The application's client secret.
     * @type {string}
     * @memberof CreateApplicationResponseApplication
     */
    clientSecret?: string;
}

/**
 * Check if a given object implements the CreateApplicationResponseApplication interface.
 */
export function instanceOfCreateApplicationResponseApplication(value: object): boolean {
    return true;
}

export function CreateApplicationResponseApplicationFromJSON(json: any): CreateApplicationResponseApplication {
    return CreateApplicationResponseApplicationFromJSONTyped(json, false);
}

export function CreateApplicationResponseApplicationFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreateApplicationResponseApplication {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'clientId': json['client_id'] == null ? undefined : json['client_id'],
        'clientSecret': json['client_secret'] == null ? undefined : json['client_secret'],
    };
}

export function CreateApplicationResponseApplicationToJSON(value?: CreateApplicationResponseApplication | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'client_id': value['clientId'],
        'client_secret': value['clientSecret'],
    };
}
