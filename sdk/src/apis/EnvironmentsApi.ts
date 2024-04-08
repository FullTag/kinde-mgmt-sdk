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
  GetEnvironmentFeatureFlagsResponse,
  SuccessResponse,
  UpdateEnvironementFeatureFlagOverrideRequest,
} from '../models/index';
import {
    ErrorResponseFromJSON,
    ErrorResponseToJSON,
    GetEnvironmentFeatureFlagsResponseFromJSON,
    GetEnvironmentFeatureFlagsResponseToJSON,
    SuccessResponseFromJSON,
    SuccessResponseToJSON,
    UpdateEnvironementFeatureFlagOverrideRequestFromJSON,
    UpdateEnvironementFeatureFlagOverrideRequestToJSON,
} from '../models/index';

export interface DeleteEnvironementFeatureFlagOverrideRequest {
    featureFlagKey: string;
}

export interface UpdateEnvironementFeatureFlagOverrideOperationRequest {
    featureFlagKey: string;
    updateEnvironementFeatureFlagOverrideRequest: UpdateEnvironementFeatureFlagOverrideRequest;
}

/**
 * 
 */
export class EnvironmentsApi extends runtime.BaseAPI {

    /**
     * Delete environment feature flag override.
     * Delete Environment Feature Flag Override
     */
    async deleteEnvironementFeatureFlagOverrideRaw(requestParameters: DeleteEnvironementFeatureFlagOverrideRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<SuccessResponse>> {
        if (requestParameters['featureFlagKey'] == null) {
            throw new runtime.RequiredError(
                'featureFlagKey',
                'Required parameter "featureFlagKey" was null or undefined when calling deleteEnvironementFeatureFlagOverride().'
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
            path: `/api/v1/environment/feature_flags/{feature_flag_key}`.replace(`{${"feature_flag_key"}}`, encodeURIComponent(String(requestParameters['featureFlagKey']))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
    }

    /**
     * Delete environment feature flag override.
     * Delete Environment Feature Flag Override
     */
    async deleteEnvironementFeatureFlagOverride(requestParameters: DeleteEnvironementFeatureFlagOverrideRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<SuccessResponse> {
        const response = await this.deleteEnvironementFeatureFlagOverrideRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Delete all environment feature flag overrides.
     * Delete Environment Feature Flag Overrides
     */
    async deleteEnvironementFeatureFlagOverridesRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<SuccessResponse>> {
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
            path: `/api/v1/environment/feature_flags`,
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
    }

    /**
     * Delete all environment feature flag overrides.
     * Delete Environment Feature Flag Overrides
     */
    async deleteEnvironementFeatureFlagOverrides(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<SuccessResponse> {
        const response = await this.deleteEnvironementFeatureFlagOverridesRaw(initOverrides);
        return await response.value();
    }

    /**
     * Get environment feature flags.
     * List Environment Feature Flags
     */
    async getEnvironementFeatureFlagsRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetEnvironmentFeatureFlagsResponse>> {
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
            path: `/api/v1/environment/feature_flags`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => GetEnvironmentFeatureFlagsResponseFromJSON(jsonValue));
    }

    /**
     * Get environment feature flags.
     * List Environment Feature Flags
     */
    async getEnvironementFeatureFlags(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetEnvironmentFeatureFlagsResponse> {
        const response = await this.getEnvironementFeatureFlagsRaw(initOverrides);
        return await response.value();
    }

    /**
     * Update environment feature flag override.
     * Update Environment Feature Flag Override
     */
    async updateEnvironementFeatureFlagOverrideRaw(requestParameters: UpdateEnvironementFeatureFlagOverrideOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<SuccessResponse>> {
        if (requestParameters['featureFlagKey'] == null) {
            throw new runtime.RequiredError(
                'featureFlagKey',
                'Required parameter "featureFlagKey" was null or undefined when calling updateEnvironementFeatureFlagOverride().'
            );
        }

        if (requestParameters['updateEnvironementFeatureFlagOverrideRequest'] == null) {
            throw new runtime.RequiredError(
                'updateEnvironementFeatureFlagOverrideRequest',
                'Required parameter "updateEnvironementFeatureFlagOverrideRequest" was null or undefined when calling updateEnvironementFeatureFlagOverride().'
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
            path: `/api/v1/environment/feature_flags/{feature_flag_key}`.replace(`{${"feature_flag_key"}}`, encodeURIComponent(String(requestParameters['featureFlagKey']))),
            method: 'PATCH',
            headers: headerParameters,
            query: queryParameters,
            body: UpdateEnvironementFeatureFlagOverrideRequestToJSON(requestParameters['updateEnvironementFeatureFlagOverrideRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
    }

    /**
     * Update environment feature flag override.
     * Update Environment Feature Flag Override
     */
    async updateEnvironementFeatureFlagOverride(requestParameters: UpdateEnvironementFeatureFlagOverrideOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<SuccessResponse> {
        const response = await this.updateEnvironementFeatureFlagOverrideRaw(requestParameters, initOverrides);
        return await response.value();
    }

}