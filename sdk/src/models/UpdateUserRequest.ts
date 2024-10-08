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
 * @interface UpdateUserRequest
 */
export interface UpdateUserRequest {
    /**
     * User's first name.
     * @type {string}
     * @memberof UpdateUserRequest
     */
    givenName?: string;
    /**
     * User's last name.
     * @type {string}
     * @memberof UpdateUserRequest
     */
    familyName?: string;
    /**
     * Whether the user is currently suspended or not.
     * @type {boolean}
     * @memberof UpdateUserRequest
     */
    isSuspended?: boolean;
    /**
     * Prompt the user to change their password on next sign in.
     * @type {boolean}
     * @memberof UpdateUserRequest
     */
    isPasswordResetRequested?: boolean;
    /**
     * An external id to reference the user.
     * @type {string}
     * @memberof UpdateUserRequest
     */
    providedId?: string;
}

/**
 * Check if a given object implements the UpdateUserRequest interface.
 */
export function instanceOfUpdateUserRequest(value: object): value is UpdateUserRequest {
    return true;
}

export function UpdateUserRequestFromJSON(json: any): UpdateUserRequest {
    return UpdateUserRequestFromJSONTyped(json, false);
}

export function UpdateUserRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): UpdateUserRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'givenName': json['given_name'] == null ? undefined : json['given_name'],
        'familyName': json['family_name'] == null ? undefined : json['family_name'],
        'isSuspended': json['is_suspended'] == null ? undefined : json['is_suspended'],
        'isPasswordResetRequested': json['is_password_reset_requested'] == null ? undefined : json['is_password_reset_requested'],
        'providedId': json['provided_id'] == null ? undefined : json['provided_id'],
    };
}

  export function UpdateUserRequestToJSON(json: any): UpdateUserRequest {
      return UpdateUserRequestToJSONTyped(json, false);
  }

  export function UpdateUserRequestToJSONTyped(value?: UpdateUserRequest | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'given_name': value['givenName'],
        'family_name': value['familyName'],
        'is_suspended': value['isSuspended'],
        'is_password_reset_requested': value['isPasswordResetRequested'],
        'provided_id': value['providedId'],
    };
}

