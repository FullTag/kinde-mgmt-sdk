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
  CreateApplicationRequest,
  CreateApplicationResponse,
  ErrorResponse,
  GetApplicationResponse,
  GetApplicationsResponse,
  GetConnectionsResponse,
  SuccessResponse,
  UpdateApplicationRequest,
} from '../models/index';
import {
    CreateApplicationRequestFromJSON,
    CreateApplicationRequestToJSON,
    CreateApplicationResponseFromJSON,
    CreateApplicationResponseToJSON,
    ErrorResponseFromJSON,
    ErrorResponseToJSON,
    GetApplicationResponseFromJSON,
    GetApplicationResponseToJSON,
    GetApplicationsResponseFromJSON,
    GetApplicationsResponseToJSON,
    GetConnectionsResponseFromJSON,
    GetConnectionsResponseToJSON,
    SuccessResponseFromJSON,
    SuccessResponseToJSON,
    UpdateApplicationRequestFromJSON,
    UpdateApplicationRequestToJSON,
} from '../models/index';

export interface CreateApplicationOperationRequest {
    createApplicationRequest?: CreateApplicationRequest;
}

export interface DeleteApplicationRequest {
    applicationId: string;
}

export interface EnableConnectionRequest {
    applicationId: string;
    connectionId: string;
}

export interface GetApplicationRequest {
    applicationId: string;
}

export interface GetApplicationConnectionsRequest {
    applicationId: string;
}

export interface GetApplicationsRequest {
    sort?: GetApplicationsSortEnum;
    pageSize?: number;
    nextToken?: string;
}

export interface RemoveConnectionRequest {
    applicationId: string;
    connectionId: string;
}

export interface UpdateApplicationOperationRequest {
    applicationId: string;
    updateApplicationRequest?: UpdateApplicationRequest;
}

/**
 * 
 */
export class ApplicationsApi extends runtime.BaseAPI {

    /**
     * Create an application.
     * Create Application
     */
    async createApplicationRaw(requestParameters: CreateApplicationOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<CreateApplicationResponse>> {
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
            path: `/api/v1/applications`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: CreateApplicationRequestToJSON(requestParameters['createApplicationRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => CreateApplicationResponseFromJSON(jsonValue));
    }

    /**
     * Create an application.
     * Create Application
     */
    async createApplication(requestParameters: CreateApplicationOperationRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<CreateApplicationResponse> {
        const response = await this.createApplicationRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Delete application. 
     * Delete Application
     */
    async deleteApplicationRaw(requestParameters: DeleteApplicationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<SuccessResponse>> {
        if (requestParameters['applicationId'] == null) {
            throw new runtime.RequiredError(
                'applicationId',
                'Required parameter "applicationId" was null or undefined when calling deleteApplication().'
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
            path: `/api/v1/applications/{application_id}`.replace(`{${"application_id"}}`, encodeURIComponent(String(requestParameters['applicationId']))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
    }

    /**
     * Delete application. 
     * Delete Application
     */
    async deleteApplication(requestParameters: DeleteApplicationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<SuccessResponse> {
        const response = await this.deleteApplicationRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Enable an auth connection for an application.
     * Enable connection
     */
    async enableConnectionRaw(requestParameters: EnableConnectionRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['applicationId'] == null) {
            throw new runtime.RequiredError(
                'applicationId',
                'Required parameter "applicationId" was null or undefined when calling enableConnection().'
            );
        }

        if (requestParameters['connectionId'] == null) {
            throw new runtime.RequiredError(
                'connectionId',
                'Required parameter "connectionId" was null or undefined when calling enableConnection().'
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
            path: `/api/v1/applications/{application_id}/connections/{connection_id}`.replace(`{${"application_id"}}`, encodeURIComponent(String(requestParameters['applicationId']))).replace(`{${"connection_id"}}`, encodeURIComponent(String(requestParameters['connectionId']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Enable an auth connection for an application.
     * Enable connection
     */
    async enableConnection(requestParameters: EnableConnectionRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.enableConnectionRaw(requestParameters, initOverrides);
    }

    /**
     * Gets an application given the application\'s id. 
     * Get Application
     */
    async getApplicationRaw(requestParameters: GetApplicationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetApplicationResponse>> {
        if (requestParameters['applicationId'] == null) {
            throw new runtime.RequiredError(
                'applicationId',
                'Required parameter "applicationId" was null or undefined when calling getApplication().'
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
            path: `/api/v1/applications/{application_id}`.replace(`{${"application_id"}}`, encodeURIComponent(String(requestParameters['applicationId']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => GetApplicationResponseFromJSON(jsonValue));
    }

    /**
     * Gets an application given the application\'s id. 
     * Get Application
     */
    async getApplication(requestParameters: GetApplicationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetApplicationResponse> {
        const response = await this.getApplicationRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Gets all connections for an application.
     * Get connections
     */
    async getApplicationConnectionsRaw(requestParameters: GetApplicationConnectionsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetConnectionsResponse>> {
        if (requestParameters['applicationId'] == null) {
            throw new runtime.RequiredError(
                'applicationId',
                'Required parameter "applicationId" was null or undefined when calling getApplicationConnections().'
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
            path: `/api/v1/applications/{application_id}/connections`.replace(`{${"application_id"}}`, encodeURIComponent(String(requestParameters['applicationId']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => GetConnectionsResponseFromJSON(jsonValue));
    }

    /**
     * Gets all connections for an application.
     * Get connections
     */
    async getApplicationConnections(requestParameters: GetApplicationConnectionsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetConnectionsResponse> {
        const response = await this.getApplicationConnectionsRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Get a list of applications. 
     * List Applications
     */
    async getApplicationsRaw(requestParameters: GetApplicationsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetApplicationsResponse>> {
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
            const token = this.configuration.accessToken;
            const tokenString = await token("kindeBearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/v1/applications`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => GetApplicationsResponseFromJSON(jsonValue));
    }

    /**
     * Get a list of applications. 
     * List Applications
     */
    async getApplications(requestParameters: GetApplicationsRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetApplicationsResponse> {
        const response = await this.getApplicationsRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Turn off an auth connection for an application
     * Remove connection
     */
    async removeConnectionRaw(requestParameters: RemoveConnectionRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<SuccessResponse>> {
        if (requestParameters['applicationId'] == null) {
            throw new runtime.RequiredError(
                'applicationId',
                'Required parameter "applicationId" was null or undefined when calling removeConnection().'
            );
        }

        if (requestParameters['connectionId'] == null) {
            throw new runtime.RequiredError(
                'connectionId',
                'Required parameter "connectionId" was null or undefined when calling removeConnection().'
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
            path: `/api/v1/applications/{application_id}/connections/{connection_id}`.replace(`{${"application_id"}}`, encodeURIComponent(String(requestParameters['applicationId']))).replace(`{${"connection_id"}}`, encodeURIComponent(String(requestParameters['connectionId']))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
    }

    /**
     * Turn off an auth connection for an application
     * Remove connection
     */
    async removeConnection(requestParameters: RemoveConnectionRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<SuccessResponse> {
        const response = await this.removeConnectionRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Update an application.
     * Update Application
     */
    async updateApplicationRaw(requestParameters: UpdateApplicationOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['applicationId'] == null) {
            throw new runtime.RequiredError(
                'applicationId',
                'Required parameter "applicationId" was null or undefined when calling updateApplication().'
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
            path: `/api/v1/applications/{application_id}`.replace(`{${"application_id"}}`, encodeURIComponent(String(requestParameters['applicationId']))),
            method: 'PATCH',
            headers: headerParameters,
            query: queryParameters,
            body: UpdateApplicationRequestToJSON(requestParameters['updateApplicationRequest']),
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Update an application.
     * Update Application
     */
    async updateApplication(requestParameters: UpdateApplicationOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.updateApplicationRaw(requestParameters, initOverrides);
    }

}

/**
 * @export
 */
export const GetApplicationsSortEnum = {
    Asc: 'name_asc',
    Desc: 'name_desc'
} as const;
export type GetApplicationsSortEnum = typeof GetApplicationsSortEnum[keyof typeof GetApplicationsSortEnum];
