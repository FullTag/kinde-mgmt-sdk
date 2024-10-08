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
 * @interface UserProfileV2
 */
export interface UserProfileV2 {
    /**
     * Unique id of the user in Kinde (deprecated).
     * @type {string}
     * @memberof UserProfileV2
     */
    id?: string;
    /**
     * Unique id of the user in Kinde.
     * @type {string}
     * @memberof UserProfileV2
     */
    sub?: string;
    /**
     * Value of the user's id in a third-party system when the user is imported into Kinde.
     * @type {string}
     * @memberof UserProfileV2
     */
    providedId?: string | null;
    /**
     * User's first and last name separated by a space.
     * @type {string}
     * @memberof UserProfileV2
     */
    name?: string;
    /**
     * User's first name.
     * @type {string}
     * @memberof UserProfileV2
     */
    givenName?: string;
    /**
     * User's last name.
     * @type {string}
     * @memberof UserProfileV2
     */
    familyName?: string;
    /**
     * Date the user was last updated at (In Unix time).
     * @type {number}
     * @memberof UserProfileV2
     */
    updatedAt?: number;
    /**
     * User's email address if available.
     * @type {string}
     * @memberof UserProfileV2
     */
    email?: string;
    /**
     * URL that point's to the user's picture or avatar
     * @type {string}
     * @memberof UserProfileV2
     */
    picture?: string;
}

/**
 * Check if a given object implements the UserProfileV2 interface.
 */
export function instanceOfUserProfileV2(value: object): value is UserProfileV2 {
    return true;
}

export function UserProfileV2FromJSON(json: any): UserProfileV2 {
    return UserProfileV2FromJSONTyped(json, false);
}

export function UserProfileV2FromJSONTyped(json: any, ignoreDiscriminator: boolean): UserProfileV2 {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'sub': json['sub'] == null ? undefined : json['sub'],
        'providedId': json['provided_id'] == null ? undefined : json['provided_id'],
        'name': json['name'] == null ? undefined : json['name'],
        'givenName': json['given_name'] == null ? undefined : json['given_name'],
        'familyName': json['family_name'] == null ? undefined : json['family_name'],
        'updatedAt': json['updated_at'] == null ? undefined : json['updated_at'],
        'email': json['email'] == null ? undefined : json['email'],
        'picture': json['picture'] == null ? undefined : json['picture'],
    };
}

  export function UserProfileV2ToJSON(json: any): UserProfileV2 {
      return UserProfileV2ToJSONTyped(json, false);
  }

  export function UserProfileV2ToJSONTyped(value?: UserProfileV2 | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'sub': value['sub'],
        'provided_id': value['providedId'],
        'name': value['name'],
        'given_name': value['givenName'],
        'family_name': value['familyName'],
        'updated_at': value['updatedAt'],
        'email': value['email'],
        'picture': value['picture'],
    };
}

