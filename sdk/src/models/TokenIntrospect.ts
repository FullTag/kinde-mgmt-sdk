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
 * @interface TokenIntrospect
 */
export interface TokenIntrospect {
    /**
     * Indicates the status of the token.
     * @type {boolean}
     * @memberof TokenIntrospect
     */
    active?: boolean;
    /**
     * Array of intended token recipients.
     * @type {Array<string>}
     * @memberof TokenIntrospect
     */
    aud?: Array<string>;
    /**
     * Identifier for the requesting client.
     * @type {string}
     * @memberof TokenIntrospect
     */
    clientId?: string;
    /**
     * Token expiration timestamp.
     * @type {string}
     * @memberof TokenIntrospect
     */
    exp?: string;
    /**
     * Token issuance timestamp.
     * @type {string}
     * @memberof TokenIntrospect
     */
    iat?: string;
}

/**
 * Check if a given object implements the TokenIntrospect interface.
 */
export function instanceOfTokenIntrospect(value: object): value is TokenIntrospect {
    return true;
}

export function TokenIntrospectFromJSON(json: any): TokenIntrospect {
    return TokenIntrospectFromJSONTyped(json, false);
}

export function TokenIntrospectFromJSONTyped(json: any, ignoreDiscriminator: boolean): TokenIntrospect {
    if (json == null) {
        return json;
    }
    return {
        
        'active': json['active'] == null ? undefined : json['active'],
        'aud': json['aud'] == null ? undefined : json['aud'],
        'clientId': json['client_id'] == null ? undefined : json['client_id'],
        'exp': json['exp'] == null ? undefined : json['exp'],
        'iat': json['iat'] == null ? undefined : json['iat'],
    };
}

  export function TokenIntrospectToJSON(json: any): TokenIntrospect {
      return TokenIntrospectToJSONTyped(json, false);
  }

  export function TokenIntrospectToJSONTyped(value?: TokenIntrospect | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'active': value['active'],
        'aud': value['aud'],
        'client_id': value['clientId'],
        'exp': value['exp'],
        'iat': value['iat'],
    };
}

