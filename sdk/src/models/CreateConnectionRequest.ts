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
 * @interface CreateConnectionRequest
 */
export interface CreateConnectionRequest {
    /**
     * The internal name of the connection.
     * @type {string}
     * @memberof CreateConnectionRequest
     */
    name: string;
    /**
     * The public facing name of the connection.
     * @type {string}
     * @memberof CreateConnectionRequest
     */
    displayName: string;
    /**
     * The identity provider identifier for the connection.
     * @type {string}
     * @memberof CreateConnectionRequest
     */
    strategy: CreateConnectionRequestStrategyEnum;
    /**
     * Client IDs of applications in which this connection is to be enabled.
     * @type {Array<string>}
     * @memberof CreateConnectionRequest
     */
    enabledApplications?: Array<string>;
    /**
     * The connection's options (varies by strategy).
     * @type {object}
     * @memberof CreateConnectionRequest
     */
    options?: object;
}


/**
 * @export
 */
export const CreateConnectionRequestStrategyEnum = {
    Oauth2apple: 'oauth2:apple',
    Oauth2azureAd: 'oauth2:azure_ad',
    Oauth2bitbucket: 'oauth2:bitbucket',
    Oauth2discord: 'oauth2:discord',
    Oauth2facebook: 'oauth2:facebook',
    Oauth2github: 'oauth2:github',
    Oauth2gitlab: 'oauth2:gitlab',
    Oauth2google: 'oauth2:google',
    Oauth2linkedin: 'oauth2:linkedin',
    Oauth2microsoft: 'oauth2:microsoft',
    Oauth2patreon: 'oauth2:patreon',
    Oauth2slack: 'oauth2:slack',
    Oauth2stripe: 'oauth2:stripe',
    Oauth2twitch: 'oauth2:twitch',
    Oauth2twitter: 'oauth2:twitter',
    Oauth2xero: 'oauth2:xero',
    Samlcustom: 'saml:custom',
    WsfedazureAd: 'wsfed:azure_ad'
} as const;
export type CreateConnectionRequestStrategyEnum = typeof CreateConnectionRequestStrategyEnum[keyof typeof CreateConnectionRequestStrategyEnum];


/**
 * Check if a given object implements the CreateConnectionRequest interface.
 */
export function instanceOfCreateConnectionRequest(value: object): value is CreateConnectionRequest {
    if (!('name' in value) || value['name'] === undefined) return false;
    if (!('displayName' in value) || value['displayName'] === undefined) return false;
    if (!('strategy' in value) || value['strategy'] === undefined) return false;
    return true;
}

export function CreateConnectionRequestFromJSON(json: any): CreateConnectionRequest {
    return CreateConnectionRequestFromJSONTyped(json, false);
}

export function CreateConnectionRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreateConnectionRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'name': json['name'],
        'displayName': json['display_name'],
        'strategy': json['strategy'],
        'enabledApplications': json['enabled_applications'] == null ? undefined : json['enabled_applications'],
        'options': json['options'] == null ? undefined : json['options'],
    };
}

  export function CreateConnectionRequestToJSON(json: any): CreateConnectionRequest {
      return CreateConnectionRequestToJSONTyped(json, false);
  }

  export function CreateConnectionRequestToJSONTyped(value?: CreateConnectionRequest | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'name': value['name'],
        'display_name': value['displayName'],
        'strategy': value['strategy'],
        'enabled_applications': value['enabledApplications'],
        'options': value['options'],
    };
}

