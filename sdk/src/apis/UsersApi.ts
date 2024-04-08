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


import * as runtime from '../runtime';
import type {
  CreateUserRequest,
  CreateUserResponse,
  ErrorResponse,
  GetPropertyValuesResponse,
  SuccessResponse,
  UpdateOrganizationPropertiesRequest,
  UpdateUserRequest,
  UpdateUserResponse,
  User,
  UsersResponse,
} from '../models/index';
import {
    CreateUserRequestFromJSON,
    CreateUserRequestToJSON,
    CreateUserResponseFromJSON,
    CreateUserResponseToJSON,
    ErrorResponseFromJSON,
    ErrorResponseToJSON,
    GetPropertyValuesResponseFromJSON,
    GetPropertyValuesResponseToJSON,
    SuccessResponseFromJSON,
    SuccessResponseToJSON,
    UpdateOrganizationPropertiesRequestFromJSON,
    UpdateOrganizationPropertiesRequestToJSON,
    UpdateUserRequestFromJSON,
    UpdateUserRequestToJSON,
    UpdateUserResponseFromJSON,
    UpdateUserResponseToJSON,
    UserFromJSON,
    UserToJSON,
    UsersResponseFromJSON,
    UsersResponseToJSON,
} from '../models/index';

export interface CreateUserOperationRequest {
    createUserRequest?: CreateUserRequest;
}

export interface DeleteUserRequest {
    id: string;
    isDeleteProfile?: boolean;
}

export interface GetUserDataRequest {
    id: string;
    expand?: string;
}

export interface GetUserPropertyValuesRequest {
    userId: string;
}

export interface GetUsersRequest {
    pageSize?: number;
    userId?: string;
    nextToken?: string;
    email?: string;
    expand?: string;
}

export interface RefreshUserClaimsRequest {
    userId: string;
}

export interface UpdateUserOperationRequest {
    id: string;
    updateUserRequest: UpdateUserRequest;
}

export interface UpdateUserFeatureFlagOverrideRequest {
    userId: string;
    featureFlagKey: string;
    value: string;
}

export interface UpdateUserPropertiesRequest {
    userId: string;
    updateOrganizationPropertiesRequest: UpdateOrganizationPropertiesRequest;
}

export interface UpdateUserPropertyRequest {
    userId: string;
    propertyKey: string;
    value: string;
}

/**
 * 
 */
export class UsersApi extends runtime.BaseAPI {

    /**
     * Creates a user record and optionally zero or more identities for the user. An example identity could be the email address of the user. 
     * Create User
     */
    async createUserRaw(requestParameters: CreateUserOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<CreateUserResponse>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("kindeBearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/v1/user`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: CreateUserRequestToJSON(requestParameters['createUserRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => CreateUserResponseFromJSON(jsonValue));
    }

    /**
     * Creates a user record and optionally zero or more identities for the user. An example identity could be the email address of the user. 
     * Create User
     */
    async createUser(requestParameters: CreateUserOperationRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<CreateUserResponse> {
        const response = await this.createUserRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Delete a user record. 
     * Delete User
     */
    async deleteUserRaw(requestParameters: DeleteUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<SuccessResponse>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling deleteUser().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['id'] != null) {
            queryParameters['id'] = requestParameters['id'];
        }

        if (requestParameters['isDeleteProfile'] != null) {
            queryParameters['is_delete_profile'] = requestParameters['isDeleteProfile'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("kindeBearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/v1/user`,
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
    }

    /**
     * Delete a user record. 
     * Delete User
     */
    async deleteUser(requestParameters: DeleteUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<SuccessResponse> {
        const response = await this.deleteUserRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Retrieve a user record. 
     * Get User
     */
    async getUserDataRaw(requestParameters: GetUserDataRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<User>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling getUserData().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['id'] != null) {
            queryParameters['id'] = requestParameters['id'];
        }

        if (requestParameters['expand'] != null) {
            queryParameters['expand'] = requestParameters['expand'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("kindeBearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/v1/user`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UserFromJSON(jsonValue));
    }

    /**
     * Retrieve a user record. 
     * Get User
     */
    async getUserData(requestParameters: GetUserDataRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<User> {
        const response = await this.getUserDataRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Gets properties for an user by ID. 
     * Get property values
     */
    async getUserPropertyValuesRaw(requestParameters: GetUserPropertyValuesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetPropertyValuesResponse>> {
        if (requestParameters['userId'] == null) {
            throw new runtime.RequiredError(
                'userId',
                'Required parameter "userId" was null or undefined when calling getUserPropertyValues().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("kindeBearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/v1/users/{user_id}/properties`.replace(`{${"user_id"}}`, encodeURIComponent(String(requestParameters['userId']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => GetPropertyValuesResponseFromJSON(jsonValue));
    }

    /**
     * Gets properties for an user by ID. 
     * Get property values
     */
    async getUserPropertyValues(requestParameters: GetUserPropertyValuesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetPropertyValuesResponse> {
        const response = await this.getUserPropertyValuesRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * The returned list can be sorted by full name or email address in ascending or descending order. The number of records to return at a time can also be controlled using the `page_size` query string parameter. 
     * List Users
     */
    async getUsersRaw(requestParameters: GetUsersRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<UsersResponse>> {
        const queryParameters: any = {};

        if (requestParameters['pageSize'] != null) {
            queryParameters['page_size'] = requestParameters['pageSize'];
        }

        if (requestParameters['userId'] != null) {
            queryParameters['user_id'] = requestParameters['userId'];
        }

        if (requestParameters['nextToken'] != null) {
            queryParameters['next_token'] = requestParameters['nextToken'];
        }

        if (requestParameters['email'] != null) {
            queryParameters['email'] = requestParameters['email'];
        }

        if (requestParameters['expand'] != null) {
            queryParameters['expand'] = requestParameters['expand'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("kindeBearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/v1/users`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UsersResponseFromJSON(jsonValue));
    }

    /**
     * The returned list can be sorted by full name or email address in ascending or descending order. The number of records to return at a time can also be controlled using the `page_size` query string parameter. 
     * List Users
     */
    async getUsers(requestParameters: GetUsersRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<UsersResponse> {
        const response = await this.getUsersRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Refreshes the user\'s claims and invalidates the current cache. 
     * Refresh User Claims and Invalidate Cache
     */
    async refreshUserClaimsRaw(requestParameters: RefreshUserClaimsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<SuccessResponse>> {
        if (requestParameters['userId'] == null) {
            throw new runtime.RequiredError(
                'userId',
                'Required parameter "userId" was null or undefined when calling refreshUserClaims().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("kindeBearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/v1/users/{user_id}/refresh_claims`.replace(`{${"user_id"}}`, encodeURIComponent(String(requestParameters['userId']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
    }

    /**
     * Refreshes the user\'s claims and invalidates the current cache. 
     * Refresh User Claims and Invalidate Cache
     */
    async refreshUserClaims(requestParameters: RefreshUserClaimsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<SuccessResponse> {
        const response = await this.refreshUserClaimsRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Update a user record. 
     * Update User
     */
    async updateUserRaw(requestParameters: UpdateUserOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<UpdateUserResponse>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling updateUser().'
            );
        }

        if (requestParameters['updateUserRequest'] == null) {
            throw new runtime.RequiredError(
                'updateUserRequest',
                'Required parameter "updateUserRequest" was null or undefined when calling updateUser().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['id'] != null) {
            queryParameters['id'] = requestParameters['id'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("kindeBearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/v1/user`,
            method: 'PATCH',
            headers: headerParameters,
            query: queryParameters,
            body: UpdateUserRequestToJSON(requestParameters['updateUserRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UpdateUserResponseFromJSON(jsonValue));
    }

    /**
     * Update a user record. 
     * Update User
     */
    async updateUser(requestParameters: UpdateUserOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<UpdateUserResponse> {
        const response = await this.updateUserRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Update user feature flag override.
     * Update User Feature Flag Override
     */
    async updateUserFeatureFlagOverrideRaw(requestParameters: UpdateUserFeatureFlagOverrideRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<SuccessResponse>> {
        if (requestParameters['userId'] == null) {
            throw new runtime.RequiredError(
                'userId',
                'Required parameter "userId" was null or undefined when calling updateUserFeatureFlagOverride().'
            );
        }

        if (requestParameters['featureFlagKey'] == null) {
            throw new runtime.RequiredError(
                'featureFlagKey',
                'Required parameter "featureFlagKey" was null or undefined when calling updateUserFeatureFlagOverride().'
            );
        }

        if (requestParameters['value'] == null) {
            throw new runtime.RequiredError(
                'value',
                'Required parameter "value" was null or undefined when calling updateUserFeatureFlagOverride().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['value'] != null) {
            queryParameters['value'] = requestParameters['value'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("kindeBearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/v1/users/{user_id}/feature_flags/{feature_flag_key}`.replace(`{${"user_id"}}`, encodeURIComponent(String(requestParameters['userId']))).replace(`{${"feature_flag_key"}}`, encodeURIComponent(String(requestParameters['featureFlagKey']))),
            method: 'PATCH',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
    }

    /**
     * Update user feature flag override.
     * Update User Feature Flag Override
     */
    async updateUserFeatureFlagOverride(requestParameters: UpdateUserFeatureFlagOverrideRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<SuccessResponse> {
        const response = await this.updateUserFeatureFlagOverrideRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Update property values.
     * Update Property values
     */
    async updateUserPropertiesRaw(requestParameters: UpdateUserPropertiesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<SuccessResponse>> {
        if (requestParameters['userId'] == null) {
            throw new runtime.RequiredError(
                'userId',
                'Required parameter "userId" was null or undefined when calling updateUserProperties().'
            );
        }

        if (requestParameters['updateOrganizationPropertiesRequest'] == null) {
            throw new runtime.RequiredError(
                'updateOrganizationPropertiesRequest',
                'Required parameter "updateOrganizationPropertiesRequest" was null or undefined when calling updateUserProperties().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("kindeBearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/v1/users/{user_id}/properties`.replace(`{${"user_id"}}`, encodeURIComponent(String(requestParameters['userId']))),
            method: 'PATCH',
            headers: headerParameters,
            query: queryParameters,
            body: UpdateOrganizationPropertiesRequestToJSON(requestParameters['updateOrganizationPropertiesRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
    }

    /**
     * Update property values.
     * Update Property values
     */
    async updateUserProperties(requestParameters: UpdateUserPropertiesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<SuccessResponse> {
        const response = await this.updateUserPropertiesRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Update property value.
     * Update Property value
     */
    async updateUserPropertyRaw(requestParameters: UpdateUserPropertyRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<SuccessResponse>> {
        if (requestParameters['userId'] == null) {
            throw new runtime.RequiredError(
                'userId',
                'Required parameter "userId" was null or undefined when calling updateUserProperty().'
            );
        }

        if (requestParameters['propertyKey'] == null) {
            throw new runtime.RequiredError(
                'propertyKey',
                'Required parameter "propertyKey" was null or undefined when calling updateUserProperty().'
            );
        }

        if (requestParameters['value'] == null) {
            throw new runtime.RequiredError(
                'value',
                'Required parameter "value" was null or undefined when calling updateUserProperty().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['value'] != null) {
            queryParameters['value'] = requestParameters['value'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("kindeBearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/v1/users/{user_id}/properties/{property_key}`.replace(`{${"user_id"}}`, encodeURIComponent(String(requestParameters['userId']))).replace(`{${"property_key"}}`, encodeURIComponent(String(requestParameters['propertyKey']))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
    }

    /**
     * Update property value.
     * Update Property value
     */
    async updateUserProperty(requestParameters: UpdateUserPropertyRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<SuccessResponse> {
        const response = await this.updateUserPropertyRaw(requestParameters, initOverrides);
        return await response.value();
    }

}