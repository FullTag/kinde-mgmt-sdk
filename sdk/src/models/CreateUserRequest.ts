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
import type { CreateUserRequestIdentitiesInner } from './CreateUserRequestIdentitiesInner';
import {
    CreateUserRequestIdentitiesInnerFromJSON,
    CreateUserRequestIdentitiesInnerFromJSONTyped,
    CreateUserRequestIdentitiesInnerToJSON,
} from './CreateUserRequestIdentitiesInner';
import type { CreateUserRequestProfile } from './CreateUserRequestProfile';
import {
    CreateUserRequestProfileFromJSON,
    CreateUserRequestProfileFromJSONTyped,
    CreateUserRequestProfileToJSON,
} from './CreateUserRequestProfile';

/**
 * 
 * @export
 * @interface CreateUserRequest
 */
export interface CreateUserRequest {
    /**
     * 
     * @type {CreateUserRequestProfile}
     * @memberof CreateUserRequest
     */
    profile?: CreateUserRequestProfile;
    /**
     * The unique code associated with the organization you want the user to join.
     * @type {string}
     * @memberof CreateUserRequest
     */
    organizationCode?: string;
    /**
     * Array of identities to assign to the created user
     * @type {Array<CreateUserRequestIdentitiesInner>}
     * @memberof CreateUserRequest
     */
    identities?: Array<CreateUserRequestIdentitiesInner>;
}

/**
 * Check if a given object implements the CreateUserRequest interface.
 */
export function instanceOfCreateUserRequest(value: object): value is CreateUserRequest {
    return true;
}

export function CreateUserRequestFromJSON(json: any): CreateUserRequest {
    return CreateUserRequestFromJSONTyped(json, false);
}

export function CreateUserRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreateUserRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'profile': json['profile'] == null ? undefined : CreateUserRequestProfileFromJSON(json['profile']),
        'organizationCode': json['organization_code'] == null ? undefined : json['organization_code'],
        'identities': json['identities'] == null ? undefined : ((json['identities'] as Array<any>).map(CreateUserRequestIdentitiesInnerFromJSON)),
    };
}

export function CreateUserRequestToJSON(value?: CreateUserRequest | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'profile': CreateUserRequestProfileToJSON(value['profile']),
        'organization_code': value['organizationCode'],
        'identities': value['identities'] == null ? undefined : ((value['identities'] as Array<any>).map(CreateUserRequestIdentitiesInnerToJSON)),
    };
}

