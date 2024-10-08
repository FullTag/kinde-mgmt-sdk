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
 * @interface CreateConnectionResponseConnection
 */
export interface CreateConnectionResponseConnection {
    /**
     * The connection's ID.
     * @type {string}
     * @memberof CreateConnectionResponseConnection
     */
    id?: string;
}

/**
 * Check if a given object implements the CreateConnectionResponseConnection interface.
 */
export function instanceOfCreateConnectionResponseConnection(value: object): value is CreateConnectionResponseConnection {
    return true;
}

export function CreateConnectionResponseConnectionFromJSON(json: any): CreateConnectionResponseConnection {
    return CreateConnectionResponseConnectionFromJSONTyped(json, false);
}

export function CreateConnectionResponseConnectionFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreateConnectionResponseConnection {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
    };
}

  export function CreateConnectionResponseConnectionToJSON(json: any): CreateConnectionResponseConnection {
      return CreateConnectionResponseConnectionToJSONTyped(json, false);
  }

  export function CreateConnectionResponseConnectionToJSONTyped(value?: CreateConnectionResponseConnection | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
    };
}

