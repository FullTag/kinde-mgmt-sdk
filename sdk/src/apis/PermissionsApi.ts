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
  CreatePermissionRequest,
  ErrorResponse,
  GetPermissionsResponse,
  SuccessResponse,
} from '../models/index';
import {
    CreatePermissionRequestFromJSON,
    CreatePermissionRequestToJSON,
    ErrorResponseFromJSON,
    ErrorResponseToJSON,
    GetPermissionsResponseFromJSON,
    GetPermissionsResponseToJSON,
    SuccessResponseFromJSON,
    SuccessResponseToJSON,
} from '../models/index';

export interface CreatePermissionOperationRequest {
    createPermissionRequest?: CreatePermissionRequest;
}

export interface DeletePermissionRequest {
    permissionId: string;
}

export interface GetPermissionsRequest {
    sort?: GetPermissionsSortEnum;
    pageSize?: number | null;
    nextToken?: string | null;
}

export interface UpdatePermissionsRequest {
    permissionId: number;
    createPermissionRequest?: CreatePermissionRequest;
}

/**
 * 
 */
export class PermissionsApi extends runtime.BaseAPI {

    /**
     * Create a new permission.
     * Create Permission
     */
    async createPermissionRaw(requestParameters: CreatePermissionOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<SuccessResponse>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["create:permissions"]);
        }

        const response = await this.request({
            path: `/api/v1/permissions`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: CreatePermissionRequestToJSON(requestParameters['createPermissionRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
    }

    /**
     * Create a new permission.
     * Create Permission
     */
    async createPermission(requestParameters: CreatePermissionOperationRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<SuccessResponse> {
        const response = await this.createPermissionRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Delete permission
     * Delete Permission
     */
    async deletePermissionRaw(requestParameters: DeletePermissionRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<SuccessResponse>> {
        if (requestParameters['permissionId'] == null) {
            throw new runtime.RequiredError(
                'permissionId',
                'Required parameter "permissionId" was null or undefined when calling deletePermission().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["delete:permissions"]);
        }

        const response = await this.request({
            path: `/api/v1/permissions/{permission_id}`.replace(`{${"permission_id"}}`, encodeURIComponent(String(requestParameters['permissionId']))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
    }

    /**
     * Delete permission
     * Delete Permission
     */
    async deletePermission(requestParameters: DeletePermissionRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<SuccessResponse> {
        const response = await this.deletePermissionRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * The returned list can be sorted by permission name or permission ID in ascending or descending order. The number of records to return at a time can also be controlled using the `page_size` query string parameter. 
     * List Permissions
     */
    async getPermissionsRaw(requestParameters: GetPermissionsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetPermissionsResponse>> {
        const queryParameters: any = {};

        if (requestParameters['sort'] != null) {
            queryParameters['sort'] = requestParameters['sort'];
        }

        if (requestParameters['pageSize'] != null) {
            queryParameters['page_size'] = requestParameters['pageSize'];
        }

        if (requestParameters['nextToken'] != null) {
            queryParameters['next_token'] = requestParameters['nextToken'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:permissions"]);
        }

        const response = await this.request({
            path: `/api/v1/permissions`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => GetPermissionsResponseFromJSON(jsonValue));
    }

    /**
     * The returned list can be sorted by permission name or permission ID in ascending or descending order. The number of records to return at a time can also be controlled using the `page_size` query string parameter. 
     * List Permissions
     */
    async getPermissions(requestParameters: GetPermissionsRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetPermissionsResponse> {
        const response = await this.getPermissionsRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Update permission
     * Update Permission
     */
    async updatePermissionsRaw(requestParameters: UpdatePermissionsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<SuccessResponse>> {
        if (requestParameters['permissionId'] == null) {
            throw new runtime.RequiredError(
                'permissionId',
                'Required parameter "permissionId" was null or undefined when calling updatePermissions().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:permissions"]);
        }

        const response = await this.request({
            path: `/api/v1/permissions/{permission_id}`.replace(`{${"permission_id"}}`, encodeURIComponent(String(requestParameters['permissionId']))),
            method: 'PATCH',
            headers: headerParameters,
            query: queryParameters,
            body: CreatePermissionRequestToJSON(requestParameters['createPermissionRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
    }

    /**
     * Update permission
     * Update Permission
     */
    async updatePermissions(requestParameters: UpdatePermissionsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<SuccessResponse> {
        const response = await this.updatePermissionsRaw(requestParameters, initOverrides);
        return await response.value();
    }

}

/**
 * @export
 */
export const GetPermissionsSortEnum = {
    NameAsc: 'name_asc',
    NameDesc: 'name_desc',
    IdAsc: 'id_asc',
    IdDesc: 'id_desc'
} as const;
export type GetPermissionsSortEnum = typeof GetPermissionsSortEnum[keyof typeof GetPermissionsSortEnum];
