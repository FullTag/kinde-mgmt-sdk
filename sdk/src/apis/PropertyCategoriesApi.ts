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
  CreateCategoryRequest,
  CreateCategoryResponse,
  ErrorResponse,
  GetCategoriesResponse,
  SuccessResponse,
  UpdateCategoryRequest,
} from '../models/index';
import {
    CreateCategoryRequestFromJSON,
    CreateCategoryRequestToJSON,
    CreateCategoryResponseFromJSON,
    CreateCategoryResponseToJSON,
    ErrorResponseFromJSON,
    ErrorResponseToJSON,
    GetCategoriesResponseFromJSON,
    GetCategoriesResponseToJSON,
    SuccessResponseFromJSON,
    SuccessResponseToJSON,
    UpdateCategoryRequestFromJSON,
    UpdateCategoryRequestToJSON,
} from '../models/index';

export interface CreateCategoryOperationRequest {
    createCategoryRequest: CreateCategoryRequest;
}

export interface GetCategoriesRequest {
    pageSize?: number | null;
    startingAfter?: string | null;
    endingBefore?: string | null;
    context?: GetCategoriesContextEnum;
}

export interface UpdateCategoryOperationRequest {
    categoryId: string;
    updateCategoryRequest: UpdateCategoryRequest;
}

/**
 * 
 */
export class PropertyCategoriesApi extends runtime.BaseAPI {

    /**
     * Create category.
     * Create Category
     */
    async createCategoryRaw(requestParameters: CreateCategoryOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<CreateCategoryResponse>> {
        if (requestParameters['createCategoryRequest'] == null) {
            throw new runtime.RequiredError(
                'createCategoryRequest',
                'Required parameter "createCategoryRequest" was null or undefined when calling createCategory().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["create:property_categories"]);
        }

        const response = await this.request({
            path: `/api/v1/property_categories`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: CreateCategoryRequestToJSON(requestParameters['createCategoryRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => CreateCategoryResponseFromJSON(jsonValue));
    }

    /**
     * Create category.
     * Create Category
     */
    async createCategory(requestParameters: CreateCategoryOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<CreateCategoryResponse> {
        const response = await this.createCategoryRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Returns a list of categories. 
     * List categories
     */
    async getCategoriesRaw(requestParameters: GetCategoriesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetCategoriesResponse>> {
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
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:property_categories"]);
        }

        const response = await this.request({
            path: `/api/v1/property_categories`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => GetCategoriesResponseFromJSON(jsonValue));
    }

    /**
     * Returns a list of categories. 
     * List categories
     */
    async getCategories(requestParameters: GetCategoriesRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetCategoriesResponse> {
        const response = await this.getCategoriesRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Update category.
     * Update Category
     */
    async updateCategoryRaw(requestParameters: UpdateCategoryOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<SuccessResponse>> {
        if (requestParameters['categoryId'] == null) {
            throw new runtime.RequiredError(
                'categoryId',
                'Required parameter "categoryId" was null or undefined when calling updateCategory().'
            );
        }

        if (requestParameters['updateCategoryRequest'] == null) {
            throw new runtime.RequiredError(
                'updateCategoryRequest',
                'Required parameter "updateCategoryRequest" was null or undefined when calling updateCategory().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:property_categories"]);
        }

        const response = await this.request({
            path: `/api/v1/property_categories/{category_id}`.replace(`{${"category_id"}}`, encodeURIComponent(String(requestParameters['categoryId']))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: UpdateCategoryRequestToJSON(requestParameters['updateCategoryRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
    }

    /**
     * Update category.
     * Update Category
     */
    async updateCategory(requestParameters: UpdateCategoryOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<SuccessResponse> {
        const response = await this.updateCategoryRaw(requestParameters, initOverrides);
        return await response.value();
    }

}

/**
 * @export
 */
export const GetCategoriesContextEnum = {
    Usr: 'usr',
    Org: 'org'
} as const;
export type GetCategoriesContextEnum = typeof GetCategoriesContextEnum[keyof typeof GetCategoriesContextEnum];
