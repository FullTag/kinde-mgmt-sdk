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
 * @interface Connection
 */
export interface Connection {
    /**
     * 
     * @type {string}
     * @memberof Connection
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof Connection
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof Connection
     */
    displayName?: string;
    /**
     * 
     * @type {string}
     * @memberof Connection
     */
    strategy?: string;
}

/**
 * Check if a given object implements the Connection interface.
 */
export function instanceOfConnection(value: object): value is Connection {
    return true;
}

export function ConnectionFromJSON(json: any): Connection {
    return ConnectionFromJSONTyped(json, false);
}

export function ConnectionFromJSONTyped(json: any, ignoreDiscriminator: boolean): Connection {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'name': json['name'] == null ? undefined : json['name'],
        'displayName': json['display_name'] == null ? undefined : json['display_name'],
        'strategy': json['strategy'] == null ? undefined : json['strategy'],
    };
}

  export function ConnectionToJSON(json: any): Connection {
      return ConnectionToJSONTyped(json, false);
  }

  export function ConnectionToJSONTyped(value?: Connection | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'name': value['name'],
        'display_name': value['displayName'],
        'strategy': value['strategy'],
    };
}

