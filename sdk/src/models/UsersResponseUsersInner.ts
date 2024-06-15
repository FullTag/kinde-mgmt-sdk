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
import type { UserIdentitiesInner } from './UserIdentitiesInner';
import {
    UserIdentitiesInnerFromJSON,
    UserIdentitiesInnerFromJSONTyped,
    UserIdentitiesInnerToJSON,
} from './UserIdentitiesInner';

/**
 * 
 * @export
 * @interface UsersResponseUsersInner
 */
export interface UsersResponseUsersInner {
    /**
     * Unique id of the user in Kinde.
     * @type {string}
     * @memberof UsersResponseUsersInner
     */
    id?: string;
    /**
     * External id for user.
     * @type {string}
     * @memberof UsersResponseUsersInner
     */
    providedId?: string;
    /**
     * Default email address of the user in Kinde.
     * @type {string}
     * @memberof UsersResponseUsersInner
     */
    email?: string;
    /**
     * Primary username of the user in Kinde.
     * @type {string}
     * @memberof UsersResponseUsersInner
     */
    username?: string;
    /**
     * User's last name.
     * @type {string}
     * @memberof UsersResponseUsersInner
     */
    lastName?: string;
    /**
     * User's first name.
     * @type {string}
     * @memberof UsersResponseUsersInner
     */
    firstName?: string;
    /**
     * Whether the user is currently suspended or not.
     * @type {boolean}
     * @memberof UsersResponseUsersInner
     */
    isSuspended?: boolean;
    /**
     * User's profile picture URL.
     * @type {string}
     * @memberof UsersResponseUsersInner
     */
    picture?: string;
    /**
     * Total number of user sign ins.
     * @type {number}
     * @memberof UsersResponseUsersInner
     */
    totalSignIns?: number | null;
    /**
     * Number of consecutive failed user sign ins.
     * @type {number}
     * @memberof UsersResponseUsersInner
     */
    failedSignIns?: number | null;
    /**
     * Last sign in date in ISO 8601 format.
     * @type {string}
     * @memberof UsersResponseUsersInner
     */
    lastSignedIn?: string | null;
    /**
     * Date of user creation in ISO 8601 format.
     * @type {string}
     * @memberof UsersResponseUsersInner
     */
    createdOn?: string | null;
    /**
     * Array of organizations a user belongs to.
     * @type {Array<string>}
     * @memberof UsersResponseUsersInner
     */
    organizations?: Array<string>;
    /**
     * Array of identities belonging to the user.
     * @type {Array<UserIdentitiesInner>}
     * @memberof UsersResponseUsersInner
     */
    identities?: Array<UserIdentitiesInner>;
}

/**
 * Check if a given object implements the UsersResponseUsersInner interface.
 */
export function instanceOfUsersResponseUsersInner(value: object): value is UsersResponseUsersInner {
    return true;
}

export function UsersResponseUsersInnerFromJSON(json: any): UsersResponseUsersInner {
    return UsersResponseUsersInnerFromJSONTyped(json, false);
}

export function UsersResponseUsersInnerFromJSONTyped(json: any, ignoreDiscriminator: boolean): UsersResponseUsersInner {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'providedId': json['provided_id'] == null ? undefined : json['provided_id'],
        'email': json['email'] == null ? undefined : json['email'],
        'username': json['username'] == null ? undefined : json['username'],
        'lastName': json['last_name'] == null ? undefined : json['last_name'],
        'firstName': json['first_name'] == null ? undefined : json['first_name'],
        'isSuspended': json['is_suspended'] == null ? undefined : json['is_suspended'],
        'picture': json['picture'] == null ? undefined : json['picture'],
        'totalSignIns': json['total_sign_ins'] == null ? undefined : json['total_sign_ins'],
        'failedSignIns': json['failed_sign_ins'] == null ? undefined : json['failed_sign_ins'],
        'lastSignedIn': json['last_signed_in'] == null ? undefined : json['last_signed_in'],
        'createdOn': json['created_on'] == null ? undefined : json['created_on'],
        'organizations': json['organizations'] == null ? undefined : json['organizations'],
        'identities': json['identities'] == null ? undefined : ((json['identities'] as Array<any>).map(UserIdentitiesInnerFromJSON)),
    };
}

export function UsersResponseUsersInnerToJSON(value?: UsersResponseUsersInner | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'provided_id': value['providedId'],
        'email': value['email'],
        'username': value['username'],
        'last_name': value['lastName'],
        'first_name': value['firstName'],
        'is_suspended': value['isSuspended'],
        'picture': value['picture'],
        'total_sign_ins': value['totalSignIns'],
        'failed_sign_ins': value['failedSignIns'],
        'last_signed_in': value['lastSignedIn'],
        'created_on': value['createdOn'],
        'organizations': value['organizations'],
        'identities': value['identities'] == null ? undefined : ((value['identities'] as Array<any>).map(UserIdentitiesInnerToJSON)),
    };
}

