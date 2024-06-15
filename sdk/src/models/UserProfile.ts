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
 * @interface UserProfile
 */
export interface UserProfile {
    /**
     * Unique id of the user in Kinde.
     * @type {string}
     * @memberof UserProfile
     */
    id?: string;
    /**
     * Default email address of the user in Kinde.
     * @type {string}
     * @memberof UserProfile
     */
    preferredEmail?: string;
    /**
     * Primary username of the user in Kinde.
     * @type {string}
     * @memberof UserProfile
     */
    username?: string;
    /**
     * Value of the user's id in a third-party system when the user is imported into Kinde.
     * @type {string}
     * @memberof UserProfile
     */
    providedId?: string | null;
    /**
     * User's last name.
     * @type {string}
     * @memberof UserProfile
     */
    lastName?: string;
    /**
     * User's first name.
     * @type {string}
     * @memberof UserProfile
     */
    firstName?: string;
    /**
     * URL that point's to the user's picture or avatar
     * @type {string}
     * @memberof UserProfile
     */
    picture?: string;
}

/**
 * Check if a given object implements the UserProfile interface.
 */
export function instanceOfUserProfile(value: object): value is UserProfile {
    return true;
}

export function UserProfileFromJSON(json: any): UserProfile {
    return UserProfileFromJSONTyped(json, false);
}

export function UserProfileFromJSONTyped(json: any, ignoreDiscriminator: boolean): UserProfile {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'preferredEmail': json['preferred_email'] == null ? undefined : json['preferred_email'],
        'username': json['username'] == null ? undefined : json['username'],
        'providedId': json['provided_id'] == null ? undefined : json['provided_id'],
        'lastName': json['last_name'] == null ? undefined : json['last_name'],
        'firstName': json['first_name'] == null ? undefined : json['first_name'],
        'picture': json['picture'] == null ? undefined : json['picture'],
    };
}

export function UserProfileToJSON(value?: UserProfile | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'preferred_email': value['preferredEmail'],
        'username': value['username'],
        'provided_id': value['providedId'],
        'last_name': value['lastName'],
        'first_name': value['firstName'],
        'picture': value['picture'],
    };
}

