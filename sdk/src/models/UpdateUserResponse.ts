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
 * @interface UpdateUserResponse
 */
export interface UpdateUserResponse {
    /**
     * Unique id of the user in Kinde.
     * @type {string}
     * @memberof UpdateUserResponse
     */
    id?: string;
    /**
     * User's first name.
     * @type {string}
     * @memberof UpdateUserResponse
     */
    givenName?: string;
    /**
     * User's last name.
     * @type {string}
     * @memberof UpdateUserResponse
     */
    familyName?: string;
    /**
     * User's preferred email.
     * @type {string}
     * @memberof UpdateUserResponse
     */
    email?: string;
    /**
     * Whether the user is currently suspended or not.
     * @type {boolean}
     * @memberof UpdateUserResponse
     */
    isSuspended?: boolean;
    /**
     * Whether a password reset has been requested.
     * @type {boolean}
     * @memberof UpdateUserResponse
     */
    isPasswordResetRequested?: boolean;
    /**
     * User's profile picture URL.
     * @type {string}
     * @memberof UpdateUserResponse
     */
    picture?: string;
}

/**
 * Check if a given object implements the UpdateUserResponse interface.
 */
export function instanceOfUpdateUserResponse(value: object): value is UpdateUserResponse {
    return true;
}

export function UpdateUserResponseFromJSON(json: any): UpdateUserResponse {
    return UpdateUserResponseFromJSONTyped(json, false);
}

export function UpdateUserResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): UpdateUserResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'givenName': json['given_name'] == null ? undefined : json['given_name'],
        'familyName': json['family_name'] == null ? undefined : json['family_name'],
        'email': json['email'] == null ? undefined : json['email'],
        'isSuspended': json['is_suspended'] == null ? undefined : json['is_suspended'],
        'isPasswordResetRequested': json['is_password_reset_requested'] == null ? undefined : json['is_password_reset_requested'],
        'picture': json['picture'] == null ? undefined : json['picture'],
    };
}

  export function UpdateUserResponseToJSON(json: any): UpdateUserResponse {
      return UpdateUserResponseToJSONTyped(json, false);
  }

  export function UpdateUserResponseToJSONTyped(value?: UpdateUserResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'given_name': value['givenName'],
        'family_name': value['familyName'],
        'email': value['email'],
        'is_suspended': value['isSuspended'],
        'is_password_reset_requested': value['isPasswordResetRequested'],
        'picture': value['picture'],
    };
}

