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
  CreatePropertyRequest,
  CreatePropertyResponse,
  ErrorResponse,
  GetPropertiesResponse,
  SuccessResponse,
  UpdatePropertyRequest,
} from '../models/index';
import {
    CreatePropertyRequestFromJSON,
    CreatePropertyRequestToJSON,
    CreatePropertyResponseFromJSON,
    CreatePropertyResponseToJSON,
    ErrorResponseFromJSON,
    ErrorResponseToJSON,
    GetPropertiesResponseFromJSON,
    GetPropertiesResponseToJSON,
    SuccessResponseFromJSON,
    SuccessResponseToJSON,
    UpdatePropertyRequestFromJSON,
    UpdatePropertyRequestToJSON,
} from '../models/index';

export interface CreatePropertyOperationRequest {
    createPropertyRequest: CreatePropertyRequest;
}

export interface GetPropertiesRequest {
    pageSize?: number;
    startingAfter?: string;
    endingBefore?: string;
    context?: GetPropertiesContextEnum;
}

export interface UpdatePropertyOperationRequest {
    propertyId: string;
    updatePropertyRequest: UpdatePropertyRequest;
}

/**
 * 
 */
export class PropertiesApi extends runtime.BaseAPI {

    /**
     * Create property.
     * Create Property
     */
    async createPropertyRaw(requestParameters: CreatePropertyOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<CreatePropertyResponse>> {
        if (requestParameters['createPropertyRequest'] == null) {
            throw new runtime.RequiredError(
                'createPropertyRequest',
                'Required parameter "createPropertyRequest" was null or undefined when calling createProperty().'
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
            path: `/api/v1/properties`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: CreatePropertyRequestToJSON(requestParameters['createPropertyRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => CreatePropertyResponseFromJSON(jsonValue));
    }

    /**
     * Create property.
     * Create Property
     */
    async createProperty(requestParameters: CreatePropertyOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<CreatePropertyResponse> {
        const response = await this.createPropertyRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Returns a list of properties 
     * List properties
     */
    async getPropertiesRaw(requestParameters: GetPropertiesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetPropertiesResponse>> {
        const queryParameters: any = {};

        if (requestParameters['pageSize'] != null) {
            queryParameters['page_size'] = requestParameters['pageSize'];
        }

        if (requestParameters['startingAfter'] != null) {
            queryParameters['starting_after'] = requestParameters['startingAfter'];
        }

        if (requestParameters['endingBefore'] != null) {
            queryParameters['ending_before'] = requestParameters['endingBefore'];
        }

        if (requestParameters['context'] != null) {
            queryParameters['context'] = requestParameters['context'];
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
            path: `/api/v1/properties`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => GetPropertiesResponseFromJSON(jsonValue));
    }

    /**
     * Returns a list of properties 
     * List properties
     */
    async getProperties(requestParameters: GetPropertiesRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetPropertiesResponse> {
        const response = await this.getPropertiesRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Update property.
     * Update Property
     */
    async updatePropertyRaw(requestParameters: UpdatePropertyOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<SuccessResponse>> {
        if (requestParameters['propertyId'] == null) {
            throw new runtime.RequiredError(
                'propertyId',
                'Required parameter "propertyId" was null or undefined when calling updateProperty().'
            );
        }

        if (requestParameters['updatePropertyRequest'] == null) {
            throw new runtime.RequiredError(
                'updatePropertyRequest',
                'Required parameter "updatePropertyRequest" was null or undefined when calling updateProperty().'
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
            path: `/api/v1/properties/{property_id}`.replace(`{${"property_id"}}`, encodeURIComponent(String(requestParameters['propertyId']))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: UpdatePropertyRequestToJSON(requestParameters['updatePropertyRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
    }

    /**
     * Update property.
     * Update Property
     */
    async updateProperty(requestParameters: UpdatePropertyOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<SuccessResponse> {
        const response = await this.updatePropertyRaw(requestParameters, initOverrides);
        return await response.value();
    }

}

/**
 * @export
 */
export const GetPropertiesContextEnum = {
    Usr: 'usr',
    Org: 'org'
} as const;
export type GetPropertiesContextEnum = typeof GetPropertiesContextEnum[keyof typeof GetPropertiesContextEnum];