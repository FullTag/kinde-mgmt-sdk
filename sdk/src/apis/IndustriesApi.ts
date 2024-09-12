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
  ErrorResponse,
  GetIndustriesResponse,
} from '../models/index';
import {
    ErrorResponseFromJSON,
    ErrorResponseToJSON,
    GetIndustriesResponseFromJSON,
    GetIndustriesResponseToJSON,
} from '../models/index';

/**
 * 
 */
export class IndustriesApi extends runtime.BaseAPI {

    /**
     * Get a list of industries and associated industry keys.
     * Get industries
     */
    async getIndustriesRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetIndustriesResponse>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:industries"]);
        }

        const response = await this.request({
            path: `/api/v1/industries`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => GetIndustriesResponseFromJSON(jsonValue));
    }

    /**
     * Get a list of industries and associated industry keys.
     * Get industries
     */
    async getIndustries(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetIndustriesResponse> {
        const response = await this.getIndustriesRaw(initOverrides);
        return await response.value();
    }

}
